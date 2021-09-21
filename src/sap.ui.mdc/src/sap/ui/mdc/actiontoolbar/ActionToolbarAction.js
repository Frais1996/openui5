/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/ToolbarSeparator",
    "sap/ui/base/ManagedObjectObserver",
    "sap/ui/mdc/actiontoolbar/ActionToolbarActionRenderer",
    "sap/ui/mdc/enum/ActionToolbarActionAlignment"
], function(Control, ToolbarSeparator, ManagedObjectObserver, ActionToolbarActionRenderer, ActionToolbarActionAlignment) {
    "use strict";

    var ActionToolbarAction = Control.extend("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
        metadata: {
            library: "sap.ui.mdc",
            interfaces : [
				"sap.m.IOverflowToolbarContent"
			],
            properties: {
                layoutInformation: {
                    type: "object",
                    defaultValue: {
                        // available aggragation names: "beginning", "between", "end"
                        aggregationName: "end",
                        alignment: ActionToolbarActionAlignment.Begin
                    }
                }
            },
            defaultAggregation: "action",
            aggregations: {
                action: {
                    type: "sap.ui.core.Control",
					multiple: false
                }
            },
            associations: {
                separators: {
                    type: "sap.m.ToolbarSeparator",
                    multiple: true
                }
            },
            renderer: ActionToolbarActionRenderer
        }
    });

    ActionToolbarAction.prototype.init = function() {
        this._bSeparatorBeforeIsVisible = false;
        this._bSeparatorAfterIsVisible = false;
        this._oSeparatorBefore = new ToolbarSeparator({
            visible: this._bSeparatorBeforeIsVisible
        });
        this._oSeparatorAfter = new ToolbarSeparator({
            visible: this._bSeparatorAfterIsVisible
        });
        this.addAssociation("separators", this._oSeparatorBefore);
        this.addAssociation("separators", this._oSeparatorAfter);

        this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
        this._oObserver.observe(this, {
			parent: true,
            properties: ["visible"]
		});
    };

    ActionToolbarAction.prototype.exit = function() {
        if (this._oSeparatorBefore) {
            this._oSeparatorBefore.destroy();
            this._oSeparatorBefore = undefined;
        }
        if (this._oSeparatorAfter) {
            this._oSeparatorAfter.destroy();
            this._oSeparatorAfter = undefined;
        }
        this._bSeparatorBeforeIsVisible = undefined;
        this._bSeparatorAfterIsVisible = undefined;
    };

    ActionToolbarAction.prototype.updateSeparators = function() {
        var sAlignment = this.getLayoutInformation().alignment;
        var sAggregationName = this.getLayoutInformation().aggregationName;
        var oActionToolbar = this.getParent();
        var oActionToolbarAggregation = oActionToolbar.getAggregation(sAggregationName);

        var aControlsInAggregation = oActionToolbarAggregation.filter(function(oControl) {
            return !oControl.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction") && oControl !== this && oControl !== this._oSeparatorBefore && oControl !== this._oSeparatorAfter;
        }.bind(this));

        var aControlsInAggregationAfter = aControlsInAggregation.filter(function(oControl) {
            return oActionToolbarAggregation.indexOf(oControl) > oActionToolbarAggregation.indexOf(this) && oControl.getVisible();
        }.bind(this));

        var aControlsInAggregationBefore = aControlsInAggregation.filter(function(oControl) {
            return oActionToolbarAggregation.indexOf(oControl) < oActionToolbarAggregation.indexOf(this) && oControl.getVisible();
        }.bind(this));

        var bSeparatorBeforeVisible = sAlignment === ActionToolbarActionAlignment.End &&
            !oActionToolbar._aggregationContainsActionSeparatorBefore(sAggregationName) &&
            aControlsInAggregationBefore.length > 0;

        var bSeparatorAfterVisible = sAlignment === ActionToolbarActionAlignment.Begin &&
            !oActionToolbar._aggregationContainsActionSeparatorAfter(sAggregationName) &&
            aControlsInAggregationAfter.length > 0;

        this._oSeparatorBefore.setVisible(this.getAction() && this.getAction().getVisible() && bSeparatorBeforeVisible);
        this._oSeparatorAfter.setVisible(this.getAction() && this.getAction().getVisible() && bSeparatorAfterVisible);
    };

    ActionToolbarAction.prototype.getSeparatorBefore = function() {
        return this._oSeparatorBefore;
    };

    ActionToolbarAction.prototype.getSeparatorAfter = function() {
        return this._oSeparatorAfter;
    };

    ActionToolbarAction.prototype._observeChanges = function(oChanges) {
        if (oChanges.type === "parent" && oChanges.mutation === "unset") {
            this.destroy();
        }

        if (oChanges.name === "property" && oChanges.name === "visible") {
            this.updateSeparators();
        }
    };

    ActionToolbarAction.prototype._onBeforeEnterOverflow = function() {
        this._bSeparatorBeforeIsVisible = this._oSeparatorBefore.getVisible();
        this._bSeparatorAfterIsVisible = this._oSeparatorAfter.getVisible();
        this._oSeparatorBefore.setVisible(false);
        this._oSeparatorAfter.setVisible(false);
    };

    ActionToolbarAction.prototype._onAfterExitOverflow = function() {
        this._oSeparatorBefore.setVisible(this._bSeparatorBeforeIsVisible);
        this._oSeparatorAfter.setVisible(this._bSeparatorAfterIsVisible);
    };

    /**
	 * Sets the behavior of the <code>ActionToolbarAction</code> inside an <code>OverflowToolbar</code> configuration.
	 *
	 * @public
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
    ActionToolbarAction.prototype.getOverflowToolbarConfig = function() {
        var oConfig = {
			canOverflow: true
		};

		oConfig.onBeforeEnterOverflow = this._onBeforeEnterOverflow.bind(this);

        oConfig.onAfterExitOverflow = this._onAfterExitOverflow.bind(this);

		return oConfig;
    };

    return ActionToolbarAction;
});