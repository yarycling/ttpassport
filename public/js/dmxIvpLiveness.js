(function registerIvpLivenessComponent() {
  'use strict';

  if (!window.dmx) {
    return;
  }

  var PROVIDER = 'open-face-liveness';
  var MODEL_VERSION = '0.1.0@740b0a8';
  var FULL_COMMIT = '740b0a885d8a032e1e6c5370bddd8e09d5d0c0fa';
  var candidateRuntimePromise = null;

  function loadCandidateRuntime() {
    if (window.OpenFaceLivenessCandidate) {
      return Promise.resolve(window.OpenFaceLivenessCandidate);
    }
    candidateRuntimePromise = candidateRuntimePromise || import('/assets/ivp/liveness/liveness-runtime.js')
      .then(function runtimeLoaded() {
        if (!window.OpenFaceLivenessCandidate) {
          throw new Error('The local liveness runtime did not register its browser interface.');
        }
        return window.OpenFaceLivenessCandidate;
      });
    return candidateRuntimePromise;
  }

  function safeNumber(value) {
    return Number.isFinite(value) ? value : null;
  }

  function stopStream(stream) {
    if (stream) {
      stream.getTracks().forEach(function stopTrack(track) {
        track.stop();
      });
    }
  }

  dmx.Component('ivp-liveness', {
    initialData: {
      busy: false,
      completedChallengeCount: 0,
      errorMessage: '',
      instruction: 'Start the experimental desktop check when you are ready.',
      outcome: 'NOT_PERFORMED',
      progress: 0,
      resultJson: '',
      state: 'idle',
      totalChallengeCount: 0,
      passiveSampleCount: 0,
      saved: false
    },

    methods: {
      start: function start() {
        this._start();
      },
      cancel: function cancel() {
        this._cancel();
      },
      markSaved: function markSaved() {
        this.set('saved', true);
        this.dispatchEvent('saved');
      },
      clearSaved: function clearSaved() {
        this.set('saved', false);
      }
    },

    events: {
      complete: Event,
      saved: Event
    },

    init: function init() {
      this._video = this.$node.querySelector('[data-liveness-video]');
      this._client = null;
      this._stream = null;
      this._cancelled = false;
      this._finalized = false;
      this._timeout = null;
      this._startedAt = null;
    },

    destroy: function destroy() {
      this._cancelled = true;
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (this._client) {
        this._client.cancel();
        this._client.dispose().catch(function ignoreDisposeError() {});
      }
      stopStream(this._stream);
      if (this._video) {
        this._video.srcObject = null;
      }
    },

    _emitComplete: function emitComplete() {
      var component = this;
      dmx.nextTick(function dispatchComplete() {
        // Let App Connect flush this component's data bindings before the
        // completion event submits the native Server Connect form.
        window.setTimeout(function dispatchAfterBindings() {
          component.dispatchEvent('complete');
        }, 0);
      });
    },

    _finish: function finish(status, payload, message) {
      if (this._finalized) {
        return;
      }
      this._finalized = true;
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
      stopStream(this._stream);
      this._stream = null;
      if (this._video) {
        this._video.srcObject = null;
      }
      this.set({
        busy: false,
        errorMessage: status === 'COMPLETED' ? '' : message,
        instruction: status === 'COMPLETED'
          ? 'The experimental capture run finished. No pass/fail anti-spoof decision is configured.'
          : message,
        outcome: status,
        progress: status === 'COMPLETED' ? 100 : this.data.progress,
        resultJson: JSON.stringify(payload),
        state: status === 'COMPLETED' ? 'completed' : 'error',
        completedChallengeCount: payload.movement_challenges.completed_count,
        totalChallengeCount: payload.movement_challenges.sequence.length,
        passiveSampleCount: payload.passive_spoof ? payload.passive_spoof.sample_count : 0,
        saved: false
      });
      this._emitComplete();
    },

    _failurePayload: function failurePayload(code, reason, status) {
      return {
        experimental: true,
        provider: PROVIDER,
        provider_version: MODEL_VERSION,
        provider_commit: FULL_COMMIT,
        client_reported: true,
        server_attested: false,
        outcome: status,
        reason_code: code,
        reason: reason,
        started_at: this._startedAt,
        finished_at: new Date().toISOString(),
        identity_assertion: false,
        citizenship_assertion: false,
        movement_challenges: { sequence: [], completed: [], completed_count: 0 },
        passive_spoof: null
      };
    },

    _fail: function fail(status, code, message) {
      this._finish(status, this._failurePayload(code, message, status), message);
    },

    _onSnapshot: function onSnapshot(snapshot) {
      if (this._cancelled || this._finalized) {
        return;
      }
      var live = snapshot && snapshot.liveness;
      var progress = live && Number.isFinite(live.progress) ? live.progress : 0;
      var steps = live && Number.isFinite(live.totalSteps) ? live.totalSteps : 0;
      var currentStep = live && Number.isFinite(live.currentStep) ? live.currentStep : 0;
      var instruction = (live && live.instruction) || (snapshot && snapshot.instruction) || 'Keep your face visible and follow the instructions.';
      this.set({
        busy: true,
        instruction: instruction,
        progress: Math.max(0, Math.min(100, Math.round(progress * 100))),
        state: snapshot && snapshot.stage ? snapshot.stage : 'running',
        completedChallengeCount: Math.max(0, currentStep - 1),
        totalChallengeCount: steps
      });
    },

    _start: async function startCheck() {
      if (this.data.busy) {
        return;
      }

      this._cancelled = false;
      this._finalized = false;
      this._startedAt = new Date().toISOString();
      this.set({
        busy: true,
        completedChallengeCount: 0,
        errorMessage: '',
        instruction: 'Requesting camera access…',
        outcome: 'PENDING',
        progress: 0,
        resultJson: '',
        state: 'requestingCamera',
        totalChallengeCount: 0,
        passiveSampleCount: 0,
        saved: false
      });

      if (!this._video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this._fail('UNAVAILABLE', 'CAMERA_UNAVAILABLE', 'Camera video is not available in this browser.');
        return;
      }

      try {
        this.set({ instruction: 'Loading local liveness checks…', state: 'loadingModels' });
        var runtime = await loadCandidateRuntime();
        if (this._cancelled) {
          return;
        }
        this._stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user' }
        });
        if (this._cancelled) {
          return;
        }
        this._video.srcObject = this._stream;
        this._video.muted = true;
        this._video.playsInline = true;
        await this._video.play();
        if (!this._video.videoWidth || !this._video.videoHeight) {
          throw Object.assign(new Error('Camera video has no usable dimensions.'), { code: 'VIDEO_UNUSABLE' });
        }

        if (!runtime || typeof runtime.createOpenFaceLivenessClient !== 'function') {
          this._fail('UNAVAILABLE', 'MODEL_RUNTIME_UNAVAILABLE', 'The local liveness model runtime did not load. Reload and retry.');
          return;
        }

        var client = runtime.createOpenFaceLivenessClient();
        this._client = client;
        var component = this;
        this._timeout = setTimeout(function stopTimedOutCheck() {
          if (!component._finalized) {
            component._cancelled = true;
            client.cancel();
            component._fail('FAILED', 'CHECK_TIMEOUT', 'The check did not finish. Try again with the face centered and clearly visible.');
          }
        }, 180000);

        var result = await client.start({
          checks: { face: true, light: false, liveness: true, spoof: true },
          onSnapshot: function updateSnapshot(snapshot) {
            component._onSnapshot(snapshot);
          },
          video: this._video
        });
        if (this._cancelled || this._finalized) {
          return;
        }

        var sequence = result && result.liveness && Array.isArray(result.liveness.sequence)
          ? result.liveness.sequence
          : [];
        var completed = result && result.liveness && Array.isArray(result.liveness.completedChallenges)
          ? result.liveness.completedChallenges
          : [];
        var spoof = result && result.spoof;
        var checks = result && Array.isArray(result.checks) ? result.checks : [];
        var sampleCount = spoof && Number.isFinite(spoof.sampleCount) ? spoof.sampleCount : 0;
        var complete = checks.includes('liveness') && checks.includes('spoof') && sequence.length > 0 && completed.length === sequence.length && sampleCount > 0;
        var passive = spoof ? {
          sample_count: sampleCount,
          skipped_sample_count: safeNumber(spoof.skippedSampleCount),
          average_real_score: safeNumber(spoof.averageRealScore),
          average_paper_score: safeNumber(spoof.averagePaperScore),
          average_screen_score: safeNumber(spoof.averageScreenScore),
          median_real_score: safeNumber(spoof.medianRealScore),
          median_paper_score: safeNumber(spoof.medianPaperScore),
          median_screen_score: safeNumber(spoof.medianScreenScore),
          models_used: safeNumber(spoof.modelsUsed)
        } : null;
        var payload = {
          experimental: true,
          provider: PROVIDER,
          provider_version: MODEL_VERSION,
          provider_commit: FULL_COMMIT,
          client_reported: true,
          server_attested: false,
          outcome: complete ? 'COMPLETED' : 'FAILED',
          completed_at: Number.isFinite(result.completedAt) ? new Date(result.completedAt).toISOString() : new Date().toISOString(),
          started_at: this._startedAt,
          checks: checks,
          identity_assertion: false,
          citizenship_assertion: false,
          movement_challenges: {
            sequence: sequence,
            completed: completed,
            completed_count: completed.length
          },
          passive_spoof: passive,
          result_note: 'Processing completion only. No approved pass/fail threshold, anti-spoof accuracy claim, or legal identity decision is made.'
        };

        if (!complete) {
          payload.reason_code = 'INCOMPLETE_CANDIDATE_RESULT';
          payload.reason = 'The candidate did not return all movement challenges and passive samples.';
          this._finish('FAILED', payload, payload.reason);
          return;
        }

        this._finish('COMPLETED', payload, '');
      } catch (error) {
        if (this._cancelled) {
          return;
        }
        var errorName = error && typeof error.name === 'string' ? error.name : '';
        var errorCode = error && typeof error.code === 'string' ? error.code : '';
        if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorCode === 'permission_denied') {
          this._fail('NOT_PERFORMED', 'CAMERA_DENIED', 'Camera access was denied. Allow camera access and retry.');
        } else if (errorCode.indexOf('models.') === 0 || errorName.indexOf('Model') >= 0) {
          this._fail('UNAVAILABLE', 'MODEL_LOAD_FAILED', 'The local liveness models could not be loaded. Check the connection to this Development application and retry.');
        } else if (errorCode === 'VIDEO_UNUSABLE') {
          this._fail('FAILED', 'VIDEO_UNUSABLE', 'The camera did not provide usable video. Retry with a working camera.');
        } else {
          this._fail('FAILED', errorCode ? errorCode.slice(0, 64) : 'CHECK_FAILED', 'The experimental check could not be completed. Retry or review the saved result.');
        }
      } finally {
        if (this._timeout) {
          clearTimeout(this._timeout);
          this._timeout = null;
        }
        if (this._client) {
          var oldClient = this._client;
          this._client = null;
          await oldClient.dispose().catch(function ignoreDisposeError() {});
        }
        stopStream(this._stream);
        this._stream = null;
        if (this._video) {
          this._video.srcObject = null;
        }
      }
    },

    _cancel: function cancelCheck() {
      if (!this.data.busy || this._finalized) {
        return;
      }
      this._cancelled = true;
      if (this._client) {
        this._client.cancel();
      }
      this._fail('NOT_PERFORMED', 'CANCELLED', 'The camera check was cancelled. It was not completed.');
    }
  });
})();
