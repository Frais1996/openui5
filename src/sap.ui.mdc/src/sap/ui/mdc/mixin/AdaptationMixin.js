/*!
 * ${copyright}
 */

sap.ui.define(
    [
        "sap/ui/mdc/p13n/Engine"
],
    function (Engine) {
        "use strict";

        /**
         * @namespace
         * @name sap.ui.mdc.mixin
         * @private
         * @since 1.82.0
         * @experimental As of version 1.82.0
         * @ui5-restricted sap.ui.mdc
         */

        /**
         * Enhances a given control prototype with consolidated handling for adaptation.
         *
         * The following methods are available:
         *
         * <ul>
         * <li><code>getEngine</code> - Provides access to the adaptation engine singleton instance.</li>
         * <li><code>retrieveInbuiltFilter</code> - Provides access to the AdaptationFilterBar initialization</li>
         * <li><code>getInbuiltFilter</code> - Returns the AdaptationFilterBar instance, if available.</li>

         * <li><code>getAdaptationConfigAttribute</code> - Returns an adaptationConfig attribute.</li>
         * </ul>
         *
         * Additionally, the following methods are wrapped:
         *
         * <ul>
         * <li><code>exit</code></li>
         * </ul>
         *
         *
         * @author SAP SE
         * @version ${version}
         * @alias sap.ui.mdc.mixin.AdaptationMixin
         * @namespace
         * @since 1.82.0
         * @private
         * @experimental As of version 1.82.0
         * @ui5-restricted sap.ui.mdc
        */
        var AdaptationMixin = {};

        AdaptationMixin.getEngine = function() {
            return Engine.getInstance();
        };

        /**
         * Hook which is executed after a chain of changes has been processed by a changehandler.
         * <b>Note</b>: This hook will be executed whenever a change is applied or reverted, e.g:
         * <ul>
         * <li><code>variant appliance</code></li>
         * <li><code>enduser personalization</code></li>
         * <li><code>reset triggered</code></li>
         * </ul>
         *
         */
        AdaptationMixin._onModifications = function() {
            //
        };

        /**
         * Hook which is executed whenever a set of enduser changes being processed during runtime.
         *
         */
        AdaptationMixin._onChangeAppliance = function() {
            //
        };

        /**
         * Initializes the <code>AdaptationFilterBar</code> used for inbuilt filtering.
         *
         * @private
         * @returns {Promise} Returns a promise resolving in the <code>AdaptationFilterBar</code> instance
         */
        AdaptationMixin.retrieveInbuiltFilter = function () {
            if (!this._oInbuiltFilterPromise) {
                this._oInbuiltFilterPromise = new Promise(function(resolve, reject) {
                    sap.ui.require(["sap/ui/mdc/filterbar/p13n/AdaptationFilterBar"], function(AdaptationFilterBar) {

                        if (this.bIsDestroyed) {
                            reject("exit");
                            return;
                        }

                        if (!this._oP13nFilter) {
                            //create instance of 'AdaptationFilterBar'
                            this._oP13nFilter = new AdaptationFilterBar(this.getId() + "-p13nFilter",{
                                adaptationControl: this,
                                filterConditions: this.getFilterConditions()
                            });

                            if (this._registerInnerFilter){
                                this._registerInnerFilter.call(this, this._oP13nFilter);
                            }

                            this.addDependent(this._oP13nFilter);

                            resolve(this._oP13nFilter);
                        } else {
                            resolve(this._oP13nFilter);
                        }
                    }.bind(this));
                }.bind(this));
            }
            return this._oInbuiltFilterPromise;
        };

        /**
         * Triggers a validation of the control by calling <code>validateState</code>, which is implemented in the control delegate.
         *
         * @param {Object} oTheoreticalState The theoretical state to be validated; see also {@link sap.ui.mdc.p13n.StateUtil StateUtil}
         * @param {String} [sKey] The name of the control to be validated
         *
         * @returns {object} The value returned by {@link sap.ui.mdc.AggregationBaseDelegate#validateState validateState}
         */
        AdaptationMixin.validateState = function(oTheoreticalState, sKey) {
            return this.getControlDelegate().validateState(this, oTheoreticalState, sKey);
        };

        AdaptationMixin.getInbuiltFilter = function() {
            return this._oP13nFilter;
        };

        /**
         * Provides cleanup functionality for possible created adaptation related entities
         *
         * @private
         * @param {function} fnExit Existing exit callback function
         * @returns {function} Returns a thunk applicable to a control prototype, wrapping an existing exit method
         */
        AdaptationMixin.exit = function (fnExit) {
            return function () {
                if (this._oP13nFilter){
                    this._oP13nFilter.destroy();
                    this._oP13nFilter = null;
                }

                if (this._oInbuiltFilterPromise) {
                    this._oInbuiltFilterPromise = null;
                }

                if (fnExit) {
                    fnExit.apply(this, arguments);
                }
            };
        };

        return function () {
            this.retrieveInbuiltFilter = AdaptationMixin.retrieveInbuiltFilter;
            this.getInbuiltFilter = AdaptationMixin.getInbuiltFilter;
            this.validateState = AdaptationMixin.validateState;
            this._onModifications = AdaptationMixin._onModifications;
            this._onChangeAppliance = AdaptationMixin._onChangeAppliance;
            this.getEngine = AdaptationMixin.getEngine;
            this.exit = AdaptationMixin.exit(this.exit);
        };
    }
);
