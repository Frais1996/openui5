/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/ResponsivePopover",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/library",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/base/strings/capitalize",
	"sap/m/p13n/AbstractContainerItem",
	"sap/m/p13n/Container",
	"sap/m/table/columnmenu/MenuRenderer"
], function (
	ResponsivePopover,
	Button,
	Toolbar,
	ToolbarSpacer,
	library,
	Control,
	Core,
	jQuery,
	capitalize,
	AbstractContainerItem,
	Container,
	MenuRenderer
) {
	"use strict";

	/**
	 * Constructor for a new Menu.
	 *
	 * @param {string} [sId] ID for the new Menu, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new Menu
	 *
	 * @class
	 * This Menu is a popover, intended to be used by a table.
	 * It serves as a entry point for the table personalization via the column headers.
	 * The Menu is separated into two sections: quick actions and menu items.
	 *
	 * The top section of the popover contains contextual quick actions for the column the menu was triggered from.
	 * The lower section contains menu items, which consist of generic and global table settings.
	 *
	 * There are control- and application-specific quick actions and menu items.
	 * Applications are able to add their own quick actions, actions and items.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.Menu
	 */
	var Menu = Control.extend("sap.m.table.columnmenu.Menu", {
		metadata: {
			library: "sap.m",
			interfaces: ["sap.ui.core.IColumnHeaderMenu"],
			aggregations: {
				quickActions: { type: "sap.m.table.columnmenu.QuickActionBase" },
				items: { type: "sap.m.table.columnmenu.ItemBase" },
				_quickActions: { type: "sap.m.table.columnmenu.QuickActionBase", visibility: "hidden" },
				_items: { type: "sap.m.table.columnmenu.ItemBase", visibility: "hidden" }
			}
		}
	});

	var DEFAULT_KEY = "$default";
	var ARIA_POPUP_TYPE = sap.ui.core.aria.HasPopup.Dialog;

	Menu.prototype.applySettings = function (mSettings) {
		// Only works in JS views, but that's fine. This is only convenience for controls.
		if (mSettings) {
			this._addAllToPrivateAggregation(mSettings, "_quickActions");
			this._addAllToPrivateAggregation(mSettings, "_items");
		}
		Control.prototype.applySettings.apply(this, arguments);
	};

	/**
	 * Opens the popover at the specified target.
	 *
	 * @param {sap.ui.core.Control | HTMLElement} oAnchor This is the control or HTMLElement, where the popover will be placed at.
	 * @public
	 */
	Menu.prototype.openBy = function(oAnchor) {
		if (!this.getParent()) {
			Core.getUIArea(Core.getStaticAreaRef()).addContent(this, true);
		}

		this._initPopover();

		if (!this._oItemsContainer) {
			this._initItemsContainer();
		}

		this._oPopover.openBy(oAnchor);
	};

	/**
	 * Returns the <code>sap.ui.core.aria.HasPopup<\code> type of the menu.
	 *
	 * @returns {sap.ui.core.aria.HasPopup} <code>sap.ui.core.aria.HasPopup<\code> type of the menu
	 * @public
	 * @since 1.98.0
	 */
	Menu.prototype.getAriaHasPopupType = function () {
		return ARIA_POPUP_TYPE;
	};

	/**
	 * Closes the popover.
	 *
	 * @public
	 */
	Menu.prototype.close = function () {
		this._previousView = null;
		if (this._oPopover) {
			this._oPopover.close();
		}
	};

	Menu.prototype.exit = function () {
		Control.prototype.exit.apply(this, arguments);
		if (this._oPopover) {
			delete this._oPopover;
		}
		if (this._oItemsContainer) {
			delete this._oItemsContainer;
		}
	};

	Menu.prototype._addAllToPrivateAggregation = function (mSettings, sAggregationName) {
		if (mSettings[sAggregationName]) {
			mSettings[sAggregationName].forEach(function (oItem) {
				this.addAggregation(sAggregationName, oItem);
			}.bind(this));
			delete mSettings[sAggregationName];
		}
	};

	Menu.prototype._initPopover = function () {
		if (this._oPopover) {
			return;
		}

		this._oPopover = new ResponsivePopover({
			showArrow: false,
			showHeader: false,
			placement: library.PlacementType.Bottom,
			content: new AssociativeControl({control: this, height: true}),
			contentWidth: "500px",
			horizontalScrolling: false,
			verticalScrolling: false,
			afterClose: [this.close, this]
		});
		this.addDependent(this._oPopover);

		this._oPopover.addEventDelegate({
			"onAfterRendering": this._focusItem
		}, this);

		if (this.getItems().length == 0 && !this.getAggregation("_items")) {
			this._oPopover.attachAfterOpen(this._focusInitialQuickAction.bind(this));
		}
	};

	Menu.prototype._initItemsContainer = function () {
		var aControlMenuItems = (this.getAggregation("_items") || []).reduce(function (aItems, oItem) {
			return aItems.concat(oItem.getEffectiveItems());
		}, []);
		var aApplicationMenuItems = this.getItems().reduce(function (aItems, oItem) {
			return aItems.concat(oItem.getEffectiveItems());
		}, []);

		if (!this._oItemsContainer) {
			this._createItemsContainer();
		}

		aControlMenuItems.forEach(function (oColumnMenuItem, iIndex) {
			this._addView(oColumnMenuItem);
			iIndex == 0 && this._oItemsContainer.addSeparator();
		}.bind(this));
		aApplicationMenuItems.forEach(function (oColumnMenuItem, iIndex) {
			this._addView(oColumnMenuItem);
			iIndex == 0 && this._oItemsContainer.addSeparator();
		}.bind(this));
	};

	var AssociativeControl = Control.extend("sap.m.table.columnmenu.AssociativeControl", {
		metadata: {
			"final": true,
			properties: {
				height: {type: "boolean", defaultValue: false}
			},
			associations: {
				control: {type: "sap.ui.core.Control"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oControl.getHeight() && oRm.style("height", "100%");
				oRm.openEnd();
				oRm.renderControl(sap.ui.getCore().byId(oControl.getControl()));
				oRm.close("div");
			}
		}
	});

	Menu.prototype._addView = function (oMenuItem) {
		var oItem = new AbstractContainerItem({
			content: new AssociativeControl({
				control: oMenuItem.getContent(),
				height: true
			}),
			key: oMenuItem.getId(),
			text: oMenuItem.getLabel(),
			icon: oMenuItem.getIcon()
		});

		this._oItemsContainer.addView(oItem);
		this._setItemVisibility(oMenuItem, oMenuItem.getVisible());
	};

	Menu.prototype._createItemsContainer = function () {
		var oMenu = this;

		this._oBtnCancel =  new Button({
			text: this._getResourceText("table.COLUMNMENU_CANCEL"),
			press: function () {
				var sKey = oMenu._oItemsContainer.getCurrentViewKey();
				if (oMenu._fireEvent(Core.byId(sKey), "cancel")) {
					oMenu.close();
					oMenu.exit();
				}
			}
		});
		this._oBtnOk = new Button({
			text: this._getResourceText("table.COLUMNMENU_CONFIRM"),
			press: function () {
				var sKey = oMenu._oItemsContainer.getCurrentViewKey();
				if (oMenu._fireEvent(Core.byId(sKey), "confirm")) {
					oMenu.close();
				}
			}
		});

		oMenu._oItemsContainer = new Container({
			listLayout: true,
			defaultView: DEFAULT_KEY,
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					this._oBtnOk,
					this._oBtnCancel
				]
			}),
			beforeViewSwitch: function (oEvent) {
				var mParameters = oEvent.getParameters();

				if (mParameters.target !== "$default") {
					var oContainerItem = oMenu._oItemsContainer.getView(mParameters.target);
					var oColumnMenuItem = oMenu._getItemFromContainerItem(oContainerItem);
					if (oColumnMenuItem && oColumnMenuItem.firePress && !oMenu._fireEvent(oColumnMenuItem, "press")) {
						oEvent.preventDefault();
						return;
					}
				}
			},
			afterViewSwitch: function (oEvent) {
				var mParameters = oEvent.getParameters();
				this.oLayout.setShowFooter(mParameters.target !== "$default");

				oMenu._previousView = mParameters.source;
				if (mParameters.target !== "$default") {
					var oContainerItem = oMenu._oItemsContainer.getView(mParameters.target);
					if (oContainerItem) {
						var oItem = oMenu._getItemFromContainerItem(oContainerItem);
						oMenu._updateButtonState(oItem);
						oMenu._focusItem();
					}
				} else {
					oMenu._focusItem();
					this._oPopover && this._oPopover.invalidate();
				}
			}
		});
		oMenu._oItemsContainer.getHeader().addContentRight(new Button({
			text: this._getResourceText("table.COLUMNMENU_RESET"),
			press: function () {
				oMenu._fireEvent(Core.byId(oMenu._oItemsContainer.getCurrentViewKey()), "reset", false);
			}
		}));
		this._oPopover.addDependent(oMenu._oItemsContainer);
		oMenu.addDependent(oMenu._oItemsContainer);
	};

	Menu.prototype._fireEvent = function (oEntry, sEventType, bAllowPreventDefault) {
		var fnHook = oEntry["on" + capitalize(sEventType)];
		if (bAllowPreventDefault !== false) {
			var oEvent = jQuery.Event(sEventType);
			fnHook.call(oEntry, oEvent);
			return !oEvent.isDefaultPrevented();
		} else {
			fnHook.call(oEntry);
			return true;
		}
	};

	Menu.prototype._getResourceText = function(sText, vValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return sText ? this.oResourceBundle.getText(sText, vValue) : this.oResourceBundle;
	};

	Menu.prototype._getItemFromContainerItem = function (oContainerItem) {
		// Low performance as linear search has to be done
		var oItem = this.getAggregation("_items") && this.getAggregation("_items").find(function(item) {
			return item.getId() == oContainerItem.getKey();
		});
		if (!oItem) {
			oItem = this.getAggregation("items") && this.getAggregation("items").find(function(item) {
				return item.getId() == oContainerItem.getKey();
			});
		}
		return oItem;
	};

	Menu.prototype._updateButtonState = function (oItem) {
		this._oItemsContainer.getHeader().getContentRight()[0].setEnabled(oItem.getButtonSettings()["reset"]["enabled"]);
		this._oItemsContainer.getHeader().getContentRight()[0].setVisible(oItem.getButtonSettings()["reset"]["visible"]);
		this._oBtnOk.setVisible(oItem.getButtonSettings()["confirm"]["visible"]);
		this._oBtnCancel.setVisible(oItem.getButtonSettings()["cancel"]["visible"]);
	};

	Menu.prototype._focusItem = function () {
		if (this._previousView == DEFAULT_KEY) {
			this._oItemsContainer._getNavBackBtn().focus();
		} else {
			var oItem = this._oItemsContainer._getNavigationList().getItems().find(function (oItem) {
				return oItem.getVisible() && oItem._key === this._previousView;
			}.bind(this));
			oItem && oItem.focus();
		}
	};

	Menu.prototype._focusInitialQuickAction = function () {
		// Does not work with content, which contains multiple items
		if (this.getItems().length == 0 && !this.getAggregation("_items")) {
			var aQuickActions = [];
			if (this.getAggregation("_quickActions")) {
				aQuickActions = this.getAggregation("_quickActions")[0].getEffectiveQuickActions();
			} else if (this.getQuickActions().length > 0) {
				aQuickActions = this.getQuickActions()[0].getEffectiveQuickActions();
			}
			aQuickActions.length > 0 && aQuickActions[0].getContent().focus();
		}
	};

	Menu.prototype._setItemVisibility = function (oItem, bVisible) {
		var oList = this._oItemsContainer._getNavigationList().getItems();
		var oListItem = oList.find(function (oListItem) {
			return oListItem._key == oItem.getId();
		});
		oListItem && oListItem.setVisible(bVisible);
	};

	return Menu;
});