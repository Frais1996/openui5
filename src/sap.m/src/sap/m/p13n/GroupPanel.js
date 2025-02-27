/*
 * ! ${copyright}
 */
sap.ui.define([
	"./QueryPanel", "sap/m/HBox", "sap/m/CheckBox", "sap/ui/layout/Grid"
], function (QueryPanel, HBox, CheckBox, Grid) {
	"use strict";

	/**
	 * Constructor for a new <code>GroupPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control can be used to customize personalization content for grouping
	 * for an associated control instance.
	 *
	 * @extends sap.m.p13n.QueryPanel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental Since 1.96.
	 * @since 1.96
	 * @alias sap.m.p13n.GroupPanel
	 */
	var GroupPanel = QueryPanel.extend("sap.m.p13n.GroupPanel", {
		metadata: {
			properties: {
				/**
				 * Toggles an additional checkbox in the group panel to define whether items are made visible.
				 */
				enableShowField: {
					type: "boolean",
					defaultValue: false
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	GroupPanel.prototype.PRESENCE_ATTRIBUTE = "grouped";
	GroupPanel.prototype.CHANGE_REASON_SHOWIFGROUPED = "showifgrouped";

	/**
	 * P13n <code>GroupItem</code> object type.
	 *
	 * @type {sap.m.p13n.GroupItem}
	 * @static
	 * @constant
	 * @typedef {Object} sap.m.p13n.GroupItem
	 * @property {string} name The unique key of the item
	 * @property {string} label The label describing the personalization item
	 * @property {boolean} grouped Defines the grouping state of the personalization item
	 *
	 * @public
	 */

	/**
	 * Sets the personalization state of the panel instance.
	 * @name sap.m.p13n.GroupPanel.setP13nData
	 * @function
	 * @public
	 * @param {sap.m.p13n.GroupItem} aP13nData An array containing the personalization state
	 * @returns {sap.m.p13n.GroupPanel} The GroupPanel instance
	 *
	 */

	GroupPanel.prototype._createQueryRowGrid = function(oItem) {
		var sKey = oItem.name;
		var oSelect = this._createKeySelect(sKey);

		var oGrid = new Grid({
			containerQuery: true,
			defaultSpan: this.getEnableShowField() ? "XL4 L4 M4 S4" : "XL6 L6 M6 S6",
			content: [
				oSelect
			]
		}).addStyleClass("sapUiTinyMargin");

		if (this.getEnableShowField()){
			var oCheckBox = this._createCheckBox(oItem);
			oGrid.addContent(oCheckBox);
		}

		return oGrid;
	};

	GroupPanel.prototype._createCheckBox = function(oItem) {
		var sKey = oItem.name;
		var oCheckBox = new HBox({
			alignItems: "Center",
			items: [
				new CheckBox({
					enabled: sKey ? true : false,
					selected: oItem.hasOwnProperty("showIfGrouped") ? oItem.showIfGrouped : true,
					select: function(oEvt) {
						var oPanel = oEvt.getSource().getParent().getParent().getParent().getParent().getParent().getParent();
						var sKey = oEvt.oSource.getParent().getParent().getContent()[0].getSelectedItem().getKey();
						this._changeShowIfGrouped(sKey, oEvt.getParameter("selected"));
						oPanel.fireChange({
							reason: "change",
							item: {
								name: sKey,
								grouped: true,
								showIfGrouped: oEvt.getParameter("selected")
							}
						});
					}.bind(this),
					text: this._getResourceText("p13n.GROUP_CHECKBOX")
				})
			]
		});

		return oCheckBox;
	};

	GroupPanel.prototype._changeShowIfGrouped = function (sKey, bShow) {
		var aItems = this._getP13nModel().getProperty("/items").filter(function (oItem) {
			return oItem.name === sKey;
		});

		aItems[0].showIfGrouped = bShow;

		this.fireChange({
			reason: this.CHANGE_REASON_SHOWIFGROUPED,
			item: aItems[0]
		});
	};

	GroupPanel.prototype._selectKey = function(oEvt) {
		QueryPanel.prototype._selectKey.apply(this, arguments);
		//Enable CheckBox
		var oListItem = oEvt.getSource().getParent().getParent();
		var sNewKey = oEvt.getParameter("selectedItem").getKey();
		oListItem.getContent()[0].getContent()[1].getItems()[0].setEnabled(sNewKey !== this.NONE_KEY);
	};

	return GroupPanel;
});