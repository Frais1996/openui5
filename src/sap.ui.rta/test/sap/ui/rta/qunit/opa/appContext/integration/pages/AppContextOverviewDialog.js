sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop"
], function (
	Opa5,
	Press,
	Drag,
	Drop
) {
	"use strict";
	Opa5.createPageObjects({
		onTheAppContextOverviewDialogPage: {
			actions: {
				iSelectAppContext: function (sAppContextTitle) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sAppContextTitle
							}
						},
						actions: new Press()
					});
				},
				iMoveAppContextUp: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--moveUpButton-img",
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iMoveAppContextDown: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--moveDownButton-img",
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iDragAndDropAppContext: function (sDragAppContextTitle, sDropAppContextTitle, oDropOption) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sDragAppContextTitle
							}
						},
						actions: new Drag()
					});

					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sDropAppContextTitle
							}
						},
						actions: new Drop(oDropOption)
					});
				},
				iClickOnActionMenuOfAppContextWithTitle: function (sTitle) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sTitle
							},
							searchOpenDialogs: true
						},
						success: function (aAncestors) {
							var oAncestor = aAncestors[0];
							this.waitFor({
								controlType: "sap.m.MenuButton",
								matchers: new sap.ui.test.matchers.Ancestor(oAncestor),
								success: function () {
									Opa5.assert.ok(true, "Action button found and visible");
								},
								actions: new Press()
							});
						}
					});
				},
				iClickOnEditActionButton: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						properties: {
							icon: "sap-icon://edit"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnSaveActionButton: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						properties: {
							icon: "sap-icon://save"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnDeleteActionButton: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						properties: {
							icon: "sap-icon://delete"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnNewContextButton: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--manageContexts-newContextButton",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnCloseButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							text: "Close"
						},
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				}
			},
			assertions: {
				iShouldSeeAppContextDialogIsOpend: function () {
					return this.waitFor({
						controlType: "sap.ui.rta.appContexts.AppVariantOverviewDialog",
						properties: {
							title: "Overview of App Contexts"
						},
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.ok(oControl.getVisible());
						}
					});
				},
				iShouldSeeRows: function (iRowCount) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--manageContexts",
						searchOpenDialogs: true,
						success: function (oTable) {
							var aItems = oTable.getItems();
							Opa5.assert.equal(aItems.length, iRowCount);
						}
					});
				},
				iShouldSeeAppContextAtPosition: function (iPosition, sExpectedTitle, iRoleCount) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--manageContexts",
						searchOpenDialogs: true,
						success: function (oTable) {
							var aItems = oTable.getItems();
							var aCells = aItems[iPosition].getCells();
							var sRank = aCells[0].getText();
							var sTitle = aCells[1].getTitle();
							Opa5.assert.equal(sRank, iPosition + 1);
							Opa5.assert.equal(sTitle, sExpectedTitle);
							if (iRoleCount) {
								var sRoleAndCountryDescription = aCells[2].getText();
								var sExpectedSubstring = iRoleCount === 1 ? iRoleCount + " role" : iRoleCount + " roles";
								Opa5.assert.equal(true, sRoleAndCountryDescription.includes(sExpectedSubstring));
							}
						}
					});
				}
			}
		}
	});
});

