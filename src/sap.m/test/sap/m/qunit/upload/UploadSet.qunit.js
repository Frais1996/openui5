/*global QUnit*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetItem",
	"sap/m/upload/UploadSetRenderer",
	"sap/m/upload/Uploader",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/m/qunit/upload/UploadSetTestUtils",
	"sap/ui/core/Core",
	"sap/ui/core/dnd/DragAndDrop"
], function (jQuery, UploadSet, UploadSetItem, UploadSetRenderer, Uploader, Toolbar, Label, ListItemBaseRenderer,
			 Dialog, Device, MessageBox, JSONModel, TestUtils, oCore, DragAndDrop) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileName: "Alice.mp4"
				},
				{
					fileName: "Brenda.mp4",
					enabledRemove: false,
					enabledEdit: false,
					visibleRemove: false,
					visibleEdit: false
				}
			]
		};
	}

	QUnit.module("UploadSet general functionality", {
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	/* ====== */
	/* Events */
	/* ====== */

	var NoopUploader = Uploader.extend("sap.m.qunit.upload.NoopUploader", {});
	NoopUploader.prototype.uploadItem = function (oItem, aHeaders) {};
	NoopUploader.prototype.downloadItem = function (oItem, aHeaders, bAskForLocation) {};

	QUnit.test("Events beforeItemAdded and afterItemAdded are called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(5);
		var oOrigUploader,
			oNoopUploader = new NoopUploader();

		oOrigUploader = this.oUploadSet.getUploader();
		this.oUploadSet.setUploader(oNoopUploader);

		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "newFile.txt", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "newFile.txt", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "newFile.txt"}
				};
			}
		});

		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			oEvent.preventDefault();
			assert.ok(true, "beforeItemAdded event should have been called.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(false, "afterItemAdded event should have not been called, as it was canceled.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "anotherNewFile.txt"}
				};
			}
		});

		this.oUploadSet.setUploader(oOrigUploader);
	});

	QUnit.test("File upload button is not visible after setting uploadButtonInvisible to true", function(assert) {
		//Arrange
		this.oUploadSet.setUploadButtonInvisible(true);

		//Assert
		assert.equal(this.oUploadSet.getDefaultFileUploader().getVisible(), false, "File Uploader is not visible");
	});

	QUnit.test("Event beforeItemRemoved is called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(4);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.attachEventOnce("beforeItemRemoved", function (oEvent) {
			assert.ok(true, "beforeItemRemoved event should have been called.");
		});
		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();

		// Now with the prevent default
		this.oUploadSet.attachEventOnce("beforeItemRemoved", function (oEvent) {
			assert.ok(true, "beforeItemRemoved event should have been called.");
			oEvent.preventDefault();
		});
		oItem._getDeleteButton().firePress();

		// There should be no dialog
		oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.notOk(oDialog, "Remove dialog should not exist at this time.");
	});

	QUnit.test("Event afterItemRemoved is called at proper time and with correct parameters.", function (assert) {
		assert.expect(3);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.attachEventOnce("afterItemRemoved", function (oEvent) {
			assert.ok(true, "afterItemRemoved event should have been called.");
		});
		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[0].firePress();
		oDialog.getButtons()[0].getParent().fireAfterClose();
		oDialog.destroy();

		// There should be no dialog
		oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.notOk(oDialog, "Remove dialog should not exist at this time.");
	});

	QUnit.test("Event beforeItemEdited is called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(9);
		var oItem = this.oUploadSet.getItems()[0];

		// DOM inspection is needed
		this.oUploadSet.placeAt("qunit-fixture");

		// With wanton prevent default there is no edit mode
		this.oUploadSet.attachEventOnce("beforeItemEdited", function (oEvent) {
			assert.ok(true, "beforeItemEdited event should have been called.");
			oEvent.preventDefault();
		});
		oItem._getEditButton().firePress();
		oCore.applyChanges();

		// Check no edit mode in place
		assert.notOk(this.oUploadSet._oEditedItem, "UploadSet should know nothing about any edited item.");
		assert.notOk(oItem._bInEditMode, "Item should know it is NOT being edited.");
		assert.equal(oItem._getFileNameLink().$().length, 1, "File name link should be rendered.");
		assert.equal(oItem._getFileNameEdit().$().length, 0, "File name edit should be ignored.");

		oItem._getEditButton().firePress();
		oCore.applyChanges();

		// Check everybody on the same page regarding the edit mode
		assert.equal(this.oUploadSet._oEditedItem, oItem, "Item should be known to the UploadSet as the edited one.");
		assert.ok(oItem._bInEditMode, "Item should know it is being edited.");
		assert.equal(oItem._getFileNameEdit().$().length, 1, "File name edit should be rendered.");
		assert.equal(oItem._getFileNameLink().$().length, 0, "File name link should be ignored.");
	});

	QUnit.test("Event afterItemEdited is called at proper time and with correct parameters.", function (assert) {
		assert.expect(1);
		var oItem = this.oUploadSet.getItems()[0];

		// DOM inspection is needed
		this.oUploadSet.placeAt("qunit-fixture");

		this.oUploadSet.attachEventOnce("afterItemEdited", function (oEvent) {
			assert.ok(true, "afterItemEdited event should have been called.");
		});
		oItem._getEditButton().firePress();
		oCore.applyChanges();

		oItem._getConfirmRenameButton().firePress();
		oCore.applyChanges();

	});

	QUnit.test("Allow Curly bracees in the fileName property", function (assert) {
		//Arrange
		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "{newFile}.txt", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "{newFile}.txt", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "{newFile}.txt"}
				};
			}
		});
	});

	QUnit.test("Check blank filename", function (assert) {
		//Arrange
		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: ""}
				};
			}
		});
	});

	QUnit.test("Rename filename with no extension", function (assert) {
		assert.expect(2);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.placeAt("qunit-fixture");

		this.oUploadSet.attachEventOnce("afterItemEdited", function (oEvent) {
			assert.ok(true, "afterItemEdited event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "testFileName", "File name should be correct.");
		});
		oItem._getEditButton().firePress();
		oCore.applyChanges();

		oItem.setFileName("testFileName");

		oItem._getConfirmRenameButton().firePress();
		oCore.applyChanges();

	});


	QUnit.test("Check filename with no extension", function (assert) {
		//Arrange
		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "testFileName", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "testFileName", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "testFileName"}
				};
			}
		});
	});

	QUnit.test("oXhr parameters are not empty", function (assert) {
		var oUploader = new Uploader(),
			oItem = this.oUploadSet.getItems()[0],
			done = assert.async();

		this.oUploadSet.attachEventOnce("uploadCompleted",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "item param present");
			assert.ok(oEvent.getParameter("response"), "response param present");
			assert.equal(oEvent.getParameter("responseXML"), null, "response xml param not present");
			assert.ok(oEvent.getParameter("readyState"), "readystate param present");
			assert.ok(oEvent.getParameter("status"), "status param present");
			assert.ok(oEvent.getParameter("headers"), "headers param present");
			done();
		});

		//Arrange
		this.oUploadSet.registerUploaderEvents(oUploader);
		this.oUploadSet.addDependent(oUploader);
		oCore.applyChanges();

		//Act
		oUploader.uploadItem(oItem);
	});

	QUnit.test("Check multi-part form data in XMLHttpRequest", function (assert) {
		//Setup
		var oUploader = new Uploader({
			useMultipart: true
				}),
		oItem = this.oUploadSet.getItems()[0],
		oXMLHttpRequestSendSpy = this.spy(window.XMLHttpRequest.prototype, "send");
		var oFormData = new window.FormData();

		this.oUploadSet.setAggregation("uploader", oUploader);
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestSendSpy.calledWith(oFormData), "XML Http request is made with form-data");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("No data rendering - with default text and description", function(assert) {
		//Arrange
		this.oUploadSet.unbindAggregation("items");
		var sNoDataText = this.oUploadSet._oRb.getText("UPLOAD_SET_NO_DATA_TEXT");
		var sNoDataDescription = this.oUploadSet._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");

		oCore.applyChanges();
		//Assert
		assert.equal(this.oUploadSet.getNoDataText(), sNoDataText, "default text is returned for getNoDataText");
		assert.equal(this.oUploadSet.getNoDataDescription(), sNoDataDescription, "default description is returned for getNoDataDescription");
		assert.equal(this.oUploadSet.$("no-data-text").text(), sNoDataText, "default no data text is rendered in upload set");
		assert.equal(this.oUploadSet.$("no-data-description").text(), sNoDataDescription, "default no data description is rendered in upload set");
	});

	QUnit.test("No data rendering - with user specified no data text", function(assert) {
		//Arrange
		this.oUploadSet.setNoDataText("myNoDataText");
		this.oUploadSet.unbindAggregation("items");

		oCore.applyChanges();
		//Assert
		assert.equal(this.oUploadSet.$("no-data-text").text(), "myNoDataText", "The no data text set by user is rendered");
	});

	QUnit.test("No data rendering - with user specified no data description", function(assert) {
		//Arrange
		this.oUploadSet.setNoDataDescription("myNoDataDescription");
		this.oUploadSet.unbindAggregation("items");

		oCore.applyChanges();
		//Assert
		assert.equal(this.oUploadSet.$("no-data-description").text(), "myNoDataDescription", "The no data description set by user is rendered");
	});

	QUnit.test("Test httpRequestMethod property with XMLHttpRequest", function (assert) {
		//Setup
		var oUploader = new Uploader({
			httpRequestMethod: "PUT"
		}),
		oItem = this.oUploadSet.getItems()[0],
		oXMLHttpRequestOpenSpy = this.spy(window.XMLHttpRequest.prototype, "open");

		this.oUploadSet.setAggregation("uploader", oUploader);
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestOpenSpy.calledWith("PUT"), "XML Http put request is made");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("Test incomplete items are empty after upload completed", function (assert) {
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setUploadState("Ready");
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		this.oUploadSet.uploadItem(oItem);

		//Assert
		assert.equal(this.oUploadSet.getIncompleteItems(), 0, "incomplete items are empty");
	});

	QUnit.test("No Data is rendered after item is removed", function (assert) {
		assert.notOk(document.querySelector(".sapMUCNoDataPage"), "No Data template is not visible");

		var oItem1 = this.oUploadSet.getItems()[0];
		var oItem2 = this.oUploadSet.getItems()[1];
		this.oUploadSet.removeItem(oItem1);
		this.oUploadSet.removeItem(oItem2);

		oCore.applyChanges();

		//Assert
		assert.ok(document.querySelector(".sapMUCNoDataPage"), "No Data template is visible");
	});

	function createNativeDragEventDummy(sEventType) {
		var oEvent;

		if (typeof Event === "function") {
			oEvent = new Event(sEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE
			oEvent = document.createEvent("Event");
			oEvent.initEvent(sEventType, true, true);
		}

		oEvent.dataTransfer = {
			types: [],
				dropEffect: "",
				setDragImage: function() {},
			setData: function() {}
		};

		return oEvent;
	}

	function createjQueryDragEventDummy(sEventType, oControl, bRemoveId, bRemoveDraggable) {
		var oEvent = jQuery.Event(sEventType);
		var oTarget = oControl.getDomRef();

		oEvent.target = oTarget;
		if (bRemoveId === true) {
			delete oTarget.dataset.sapUi;
			oTarget.removeAttribute("id");
		}
		if (bRemoveDraggable === true) {
			oTarget.draggable = false;
		}
		oEvent.originalEvent = createNativeDragEventDummy(sEventType);

		return oEvent;
	}
	QUnit.module("Rendering of UploadSet with hideUploadButton = true", {
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false,
					uploadButtonInvisible: true
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("File upload button is visible after setting uploadButtonInvisible to false", function(assert) {
		//Arrange
		this.oUploadSet.setUploadButtonInvisible(false);
		//Assert
		assert.equal(this.oUploadSet.getDefaultFileUploader().getVisible(), true, "File Uploader is visible");
	});

	QUnit.module("Drag and drop", {
		beforeEach: function () {
			this.$RootNode = jQuery(document.body);
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Dragged into target area", function(assert) {
		var oTargetDomRef = this.oUploadSet.getList().getDomRef();
		oTargetDomRef.focus();
		var oDropInfo = this.oUploadSet.getList().getDragDropConfig()[1];
		oDropInfo.attachDragEnter(function(oEvent) {
			assert.ok(oEvent.getParameter("dragSession"), "drag session exists");
		});
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
	});

	QUnit.test("Drag and drop lifecycle & drag session", function(assert) {
		var oEvent = createjQueryDragEventDummy("dragstart", this.oUploadSet.getList().getItems()[0]);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.notEqual(oEvent.dragSession, null, "dragstart: A drag session was created for item");

		var oDragSession = oEvent.dragSession;
		this.oUploadSet.attachItemDrop(function(oEvent) {
			assert.ok(oEvent.getParameter("dragSession"), "Drop item event triggered");
		});

		oEvent = createjQueryDragEventDummy("drop", this.oUploadSet.getList().getItems()[0], false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "drop: Drag session was preserved");

		oEvent = createjQueryDragEventDummy("dragend", this.oUploadSet.getList().getItems()[0], false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "dragend: Drag session was preserved");

	});

});