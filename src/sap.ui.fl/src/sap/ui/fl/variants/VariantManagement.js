/*
 * ! ${copyright}
 */

// Provides control sap.ui.fl.variants.VariantManagement.
sap.ui.define([
	"sap/ui/model/Context",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/Grid",
	'sap/base/Log',
	"sap/m/SearchField",
	"sap/m/RadioButton",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Text",
	"sap/m/Bar",
	"sap/m/Table",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/m/CheckBox",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Title",
	"sap/m/ResponsivePopover",
	"sap/m/SelectList",
	"sap/m/ObjectIdentifier",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/VBox",
	'sap/m/HBox',
	"sap/ui/events/KeyCodes",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings"
], function(
	Context,
	PropertyBinding,
	JSONModel,
	Filter,
	FilterOperator,
	Device,
	InvisibleText,
	Control,
	Icon,
	HorizontalLayout,
	Grid,
	Log,
	SearchField,
	RadioButton,
	ColumnListItem,
	Column,
	Text,
	Bar,
	Table,
	Page,
	Toolbar,
	ToolbarSpacer,
	Button,
	ToggleButton,
	CheckBox,
	Dialog,
	Input,
	Label,
	Title,
	ResponsivePopover,
	SelectList,
	ObjectIdentifier,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	VBox,
	HBox,
	KeyCodes,
	coreLibrary,
	mobileLibrary,
	flUtils,
	flSettings
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.PopinDisplay
	var PopinDisplay = mobileLibrary.PopinDisplay;

	// shortcut for sap.m.ScreenSize
	var ScreenSize = mobileLibrary.ScreenSize;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	/**
	 * Constructor for a new <code>VariantManagement</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class Can be used to manage variants. You can use this control in most controls that are enabled for <i>key user adaptation</i>.<br>
	 * <b>Note: </b>On the user interface, variants are generally referred to as "views".
	 * @see {@link topic:f1430c0337534d469da3a56307ff76af Key User Adaptation: Enable Your App}
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @since 1.56
	 * @alias sap.ui.fl.variants.VariantManagement
	 */
	var VariantManagement = Control.extend("sap.ui.fl.variants.VariantManagement", /** @lends sap.ui.fl.variants.VariantManagement.prototype */ {
		metadata: {
			interfaces: [
				"sap.m.IOverflowToolbarContent"
			],
			library: "sap.ui.fl",
			designtime: "sap/ui/fl/designtime/variants/VariantManagement.designtime",
			properties: {
				/**
				 * Indicates that <i>Set as Default</i> is visible in the <i>Save View</i> and the <i>Manage Views</i> dialogs.
				 */
				showSetAsDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If set to <code>true</code>, the key for a vendor variant will be added manually.<br>
				 * <b>Note:</b>This flag is only used internally in the app variant scenarios.
				 */
				manualVariantKey: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that the control is in error state. If set to <code>true</code>, an error message will be displayed whenever the variant is
				 * opened.
				 */
				inErrorState: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that the control is in edit state. If set to <code>false</code>, the footer of the <i>Views</i> list will be hidden.
				 */
				editable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Determines the name of the model. The binding context will be defined by the current ID.
				 * <p>
				 * <b>Note:</b> In a UI adaptation scenario, this property is not used at all, because the model name is <code>$FlexVariants</code>.
				 */
				modelName: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Determines the intention of setting the current variant based on passed information.
				 * <p>
				 * <b>Note:</b> The <code>VariantManagement</code> control does not react in any way to this property.
				 */
				updateVariantInURL: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * When set to false, doesn't reset the <code>VariantManagement</code> control to the default variant, when its binding context is changed.
				 */
				resetOnContextChange: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Determines the behavior for Apply Automatically if the standard variant is marked as the default variant.
				 *
				 * @since 1.80
				 */
				executeOnSelectionForStandardDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Defines the Apply Automatically text for the standard variant in the Manage Views dialog if the application controls this behavior.
				 *
				 * <br><b>Note:</b> the usage of this property is restricted to <code>sap.fe</code> components only.
				 * @since 1.85
				 */
				displayTextForExecuteOnSelectionForStandardVariant: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				}
			},
			associations: {

				/**
				 * Contains the controls for which the variant management is responsible.
				 */
				"for": {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			events: {

				/**
				 * This event is fired when the <i>Save View</i> dialog or the <i>Save As</i> dialog is closed with the save button.
				 */
				save: {
					parameters: {
						/**
						 * Variant title
						 */
						name: {
							type: "string"
						},

						/**
						 * Indicates if an existing variant is overwritten or if a new variant is created.
						 */
						overwrite: {
							type: "boolean"
						},

						/**
						 * Variant key
						 */
						key: {
							type: "string"
						},

						/**
						 * <i>Apply Automatically</i> indicator
						 */
						execute: {
							type: "boolean"
						},

						/**
						 * The default variant indicator
						 */
						def: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event is fired when users presses the cancel button inside <i>Save As</i> dialog.
				 */
				cancel: {},

				/**
				 * This event is fired when users apply changes to variants in the <i>Manage Views</i> dialog.
				 */
				manage: {},

				/**
				 * This event is fired when the model and context are set.
				 */
				initialized: {},

				/**
				 * This event is fired when a new variant is selected.
				 */
				select: {
					parameters: {
						/**
						 * Variant key
						 */
						key: {
							type: "string"
						}
					}
				}
			}
		},

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm - <code>RenderManager</code> that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl - Object representation of the control that should be rendered
		 */
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl)
					.class("sapUiFlVarMngmt")
					.openEnd();

				oRm.renderControl(oControl.oVariantLayout);
				oRm.close("div");
			}
		}
	});

	VariantManagement.INNER_MODEL_NAME = "$sapUiFlVariants";
	VariantManagement.MAX_NAME_LEN = 100;
	VariantManagement.COLUMN_FAV_IDX = 0;
	VariantManagement.COLUMN_NAME_IDX = 1;

	/*
	 * Constructs and initializes the <code>VariantManagement</code> control.
	 */
	VariantManagement.prototype.init = function() {
		this._sModelName = flUtils.VARIANT_MODEL_NAME;

		this.attachModelContextChange(this._setModel, this);

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

		this._createInnerModel();

		this.oVariantInvisibleText = new InvisibleText();

		this.oVariantText = new Title(this.getId() + "-text", {
			text: {
				path: 'currentVariant',
				model: this._sModelName,
				formatter: function(sKey) {
					var sText = "";
					if (sKey) {
						sText = this.getSelectedVariantText(sKey);
						this._setInvisibleText(sText, this.getModified());
					}

					return sText;
				}.bind(this)
			}
		});

		this.oVariantText.addStyleClass("sapUiFlVarMngmtClickable");
		this.oVariantText.addStyleClass("sapUiFlVarMngmtTitle");
		this.oVariantText.addStyleClass("sapMTitleStyleH4");
		if (Device.system.phone) {
			this.oVariantText.addStyleClass("sapUiFlVarMngmtTextPhoneMaxWidth");
		} else {
			this.oVariantText.addStyleClass("sapUiFlVarMngmtTextMaxWidth");
		}

		var oVariantModifiedText = new Text(this.getId() + "-modified", {
			text: "*",
			visible: {
				path: "modified",
				model: this._sModelName,
				formatter: function(bValue) {
					var sKey = this.getCurrentVariantKey();

					if (sKey) {
						this._setInvisibleText(this.getSelectedVariantText(sKey), bValue);
					}

					return ((bValue === null) || (bValue === undefined)) ? false : bValue;
				}.bind(this)
			}
		});
		oVariantModifiedText.setVisible(false);
		oVariantModifiedText.addStyleClass("sapUiFlVarMngmtModified");
		oVariantModifiedText.addStyleClass("sapUiFlVarMngmtClickable");

		this.oVariantPopoverTrigger = new ToggleButton(this.getId() + "-trigger", {
			icon: "sap-icon://slim-arrow-down",
			type: ButtonType.Transparent,
			tooltip: this._oRb.getText("VARIANT_MANAGEMENT_TRIGGER_TT")
		});

		this.oVariantPopoverTrigger.addAriaLabelledBy(this.oVariantInvisibleText);
		this.oVariantPopoverTrigger.addStyleClass("sapUiFlVarMngmtTriggerBtn");

		this.oVariantLayout = new HorizontalLayout({
			content: [
				this.oVariantText, oVariantModifiedText, this.oVariantPopoverTrigger
			]
		});
		this.oVariantLayout.addStyleClass("sapUiFlVarMngmtLayout");

		oVariantModifiedText.setVisible(false);

		this.oVariantModifiedText = oVariantModifiedText;

		this.oVariantInvisibleText.toStatic();

		this.addDependent(this.oVariantLayout);

		this._fRegisteredApplyAutomaticallyOnStandardVariant = null;
	};

	/**
	 * Registration of a callback function. The provided callback function is executed to check if apply automatically on standard variant should be considered.
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.93
	 * @param {function} fCallBack Called when standard variant must be applied. It determines if apply automatically on standard variant should be considered.
	 * As a convenience the current variant will be passed to the callback. This variant instance may not be changed in any ways. It is only intended to provide certain variant information.
	 * @returns {this} Reference to this in order to allow method chaining.
	 */
	VariantManagement.prototype.registerApplyAutomaticallyOnStandardVariant = function(fCallBack) {
		this._fRegisteredApplyAutomaticallyOnStandardVariant = fCallBack;

		return this;
	};

	/**
	 * Retrieves the apply automatically state for a variant.
	 * @private
	 * @ui5-restricted sap.mdc
	 * @since 1.93
	 * @param {object} oVariant the inner variant object
	 * @returns {boolean} apply automatically state
	 */
	VariantManagement.prototype.getApplyAutomaticallyOnVariant = function(oVariant) {
		var bExecuteOnSelection = oVariant.executeOnSelect;

		if (this._fRegisteredApplyAutomaticallyOnStandardVariant && this.getDisplayTextForExecuteOnSelectionForStandardVariant() && (oVariant.key === this.getStandardVariantKey())) {
			try {
				bExecuteOnSelection = this._fRegisteredApplyAutomaticallyOnStandardVariant(oVariant);
			} catch (ex) {
				Log.error("callback for determination of apply automatically on standard variant failed");
			}
		}

		return bExecuteOnSelection;
	};

	/**
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 * Registers invalidations event which is fired when width of the control is changed.
	 *
	 * @protected
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	VariantManagement.prototype.getOverflowToolbarConfig = function() {
		return {
			canOverflow: false,
			invalidationEvents: ["save", "manage", "select"]
		};
	};

	/**
	 * Returns the title control of the <code>VariantManagement</code>. This is used in the key user scenario.
	 * @protected
	 * @returns {sap.m.Title} Title part of the <code>VariantManagement</code> control.
	 */
	VariantManagement.prototype.getTitle = function() {
		return this.oVariantText;
	};

	VariantManagement.prototype._setInvisibleText = function(sText, bFlag) {
		var sInvisibleTextKey;
		if (sText) {
			if (bFlag) {
				sInvisibleTextKey = "VARIANT_MANAGEMENT_SEL_VARIANT_MOD";
			} else {
				sInvisibleTextKey = "VARIANT_MANAGEMENT_SEL_VARIANT";
			}

			this.oVariantInvisibleText.setText(this._oRb.getText(sInvisibleTextKey, [sText]));
		}
	};

	VariantManagement.prototype._createInnerModel = function() {
		var oModel = new JSONModel({
			showExecuteOnSelection: false,
			showSetAsDefault: true,
			showPublic: false,
			showContexts: false,
			editable: true,
			popoverTitle: this._oRb.getText("VARIANT_MANAGEMENT_VARIANTS")
		});
		this.setModel(oModel, VariantManagement.INNER_MODEL_NAME);

		this._bindProperties();

		this._updateInnerModelWithSettingsInfo();
	};

	VariantManagement.prototype._bindProperties = function() {
		this.bindProperty("showSetAsDefault", {
			path: "/showSetAsDefault",
			model: VariantManagement.INNER_MODEL_NAME
		});
		this.bindProperty("editable", {
			path: "/editable",
			model: VariantManagement.INNER_MODEL_NAME
		});
	};

	VariantManagement.prototype._updateInnerModelWithSettingsInfo = function() {
		flSettings.getInstance().then(function (oSettings) {
			this.getModel(VariantManagement.INNER_MODEL_NAME).setProperty("/showSaveAs", oSettings.isVariantPersonalizationEnabled());
			this.getModel(VariantManagement.INNER_MODEL_NAME).setProperty("/showPublic", oSettings.isPublicFlVariantEnabled());
		}.bind(this));
	};

	VariantManagement.prototype._getShowPublic = function() {
		var oModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oModel) {
			return oModel.getProperty("/showPublic");
		}

		return false;
	};

	VariantManagement.prototype._setShowPublic = function(bValue) {
		var oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oInnerModel) {
			oInnerModel.setProperty("/showPublic", bValue);
		}
	};

	VariantManagement.prototype._getShowContexts = function() {
		var oModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oModel) {
			return oModel.getProperty("/showContexts");
		}

		return false;
	};
	VariantManagement.prototype._setShowContexts = function(bValue) {
		var oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oInnerModel) {
			oInnerModel.setProperty("/showContexts", bValue);
		}
	};

	VariantManagement.prototype._getShowExecuteOnSelection = function() {
		var oModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oModel) {
			return oModel.getProperty("/showExecuteOnSelection");
		}

		return false;
	};

	VariantManagement.prototype._setShowExecuteOnSelection = function(bValue) {
		var oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oInnerModel) {
			oInnerModel.setProperty("/showExecuteOnSelection", bValue);
		}
	};

	VariantManagement.prototype.setExecuteOnSelection = function(bValue) {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			oModel.setProperty(this.oContext + "/executeOnSelection", bValue);
		}
	};

	VariantManagement.prototype.getOriginalDefaultVariantKey = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/originalDefaultVariant");
		}
		return null;
	};

	VariantManagement.prototype.setDefaultVariantKey = function(sKey) {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			oModel.setProperty(this.oContext + "/defaultVariant", sKey);
		}
	};

	VariantManagement.prototype.getDefaultVariantKey = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/defaultVariant");
		}
		return null;
	};

	/**
	 * Sets the new selected variant.
	 * @public
	 * @param {string} sKey - Key of the variant that should be selected.
	 * @returns {this} Current instance of {@link sap.ui.fl.variants.VariantManagement}.
	 */
	VariantManagement.prototype.setCurrentVariantKey = function(sKey) {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			oModel.setProperty(this.oContext + "/currentVariant", sKey);
		}

		return this;
	};

	/**
	 * Gets the currently selected variant key.
	 * @public
	 * @returns {string} Key of the currently selected variant. In case the model is not yet set <code>null</code> will be returned.
	 */
	VariantManagement.prototype.getCurrentVariantKey = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/currentVariant");
		}

		return null;
	};

	/**
	 * Sets the popover title.
	 */
	VariantManagement.prototype._assignPopoverTitle = function() {
		var sTitle;
		var oInnerModel;
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			sTitle = oModel.getProperty(this.oContext + "/popoverTitle");
		}

		if (sTitle !== undefined) {
			oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
			if (oInnerModel) {
				oInnerModel.setProperty("/popoverTitle", sTitle);
			}
		}
	};

	/**
	 * Retrieves all variants.
	 * @public
	 * @returns {array} All variants. In case the model is not yet set, an empty array will be returned.
	 */
	VariantManagement.prototype.getVariants = function() {
		return this._getItems();
	};

	VariantManagement.prototype.setModified = function(bFlag) {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			oModel.setProperty(this.oContext + "/modified", bFlag);
		}
	};

	/**
	 * Determines if the current variant is modified.
	 * @public
	 * @returns {boolean} If the current variant is modified <code>true</code>, otherwise <code>false</code>
	 */
	VariantManagement.prototype.getModified = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/modified");
		}
		return false;
	};

	VariantManagement.prototype.getSelectedVariantText = function(sKey) {
		var oItem = this._getItemByKey(sKey);

		if (oItem) {
			return oItem.title;
		}

		return "";
	};

	VariantManagement.prototype.getStandardVariantKey = function() {
		var aItems = this._getItems();
		if (aItems && aItems[0]) {
			return aItems[0].key;
		}

		return null;
	};

	VariantManagement.prototype.getShowFavorites = function() {
		var oModel = this.getModel(this._sModelName);
		if (oModel && this.oContext) {
			return oModel.getProperty(this.oContext + "/showFavorites");
		}
		return false;
	};

	VariantManagement.prototype._clearDeletedItems = function() {
		this._aDeletedItems = [];
	};

	VariantManagement.prototype._addDeletedItem = function(oItem) {
		this._aDeletedItems.push(oItem);
	};

	VariantManagement.prototype._getDeletedItems = function() {
		return this._aDeletedItems;
	};

	VariantManagement.prototype._getItems = function() {
		var aItems = [];
		if (this.oContext && this.oContext.getObject()) {
			aItems = this.oContext.getObject().variants.filter(function(oItem) {
				if (!oItem.hasOwnProperty("visible")) {
					return true;
				}

				return oItem.visible;
			});
		}

		return aItems;
	};

	VariantManagement.prototype._getItemByKey = function(sKey) {
		var oItem = null;
		var aItems = this._getItems();
		aItems.some(function(oEntry) {
			if (oEntry.key === sKey) {
				oItem = oEntry;
			}

			return (oItem !== null);
		});

		return oItem;
	};

	VariantManagement.prototype._rebindControl = function() {
		this.oVariantText.unbindProperty("text");
		this.oVariantText.bindProperty("text", {
			path: 'currentVariant',
			model: this._sModelName,
			formatter: function(sKey) {
				var sText = "";
				if (sKey) {
					sText = this.getSelectedVariantText(sKey);
					this._setInvisibleText(sText, this.getModified());
				}

				return sText;
			}.bind(this)
		});

		this.oVariantModifiedText.unbindProperty("visible");
		this.oVariantModifiedText.bindProperty("visible", {
			path: "modified",
			model: this._sModelName,
			formatter: function(bValue) {
				var sKey = this.getCurrentVariantKey();

				if (sKey) {
					this._setInvisibleText(this.getSelectedVariantText(sKey), bValue);
				}

				return ((bValue === null) || (bValue === undefined)) ? false : bValue;
			}.bind(this)
		});
	};

	VariantManagement.prototype.setModelName = function(sValue) {
		if (this.getModelName()) {
			this.oContext = null;
		}

		this.setProperty("modelName", sValue);

		this._sModelName = sValue;

		this._rebindControl();

		return this;
	};

	VariantManagement.prototype._setBindingContext = function() {
		var oModel;
		var sLocalId;

		if (!this.oContext) {
			oModel = this.getModel(this._sModelName);
			if (oModel) {
				sLocalId = this._getLocalId(oModel);
				if (sLocalId) {
					this.oContext = new Context(oModel, "/" + sLocalId);
					this.setBindingContext(this.oContext, this._sModelName);

					if (!this.getModelName() && oModel.registerToModel) { // Relevant for key user adaptation
						oModel.registerToModel(this);
					}

					this._assignPopoverTitle();

					this._registerPropertyChanges(oModel);

					this.fireInitialized();
				}
			}
		}
	};

	VariantManagement.prototype._getLocalId = function(oModel) {
		if (this.getModelName() && (this._sModelName !== flUtils.VARIANT_MODEL_NAME)) {
			return this.getId();
		}
		return oModel.getVariantManagementReferenceForControl(this);
	};

	VariantManagement.prototype._setModel = function() {
		this._setBindingContext();
	};

	VariantManagement.prototype._registerPropertyChanges = function(oModel) {
		var oBinding = new PropertyBinding(oModel, this.oContext + "/showExecuteOnSelection");
		oBinding.attachChange(function(oData) {
			if (oData && oData.oSource && oData.oSource.oModel && oData.oSource.sPath) {
				var bFlag = oData.oSource.oModel.getProperty(oData.oSource.sPath);
				if (bFlag !== undefined) {
					this._setShowExecuteOnSelection(bFlag);
				}
			}
		}.bind(this));

		oBinding = new PropertyBinding(oModel, this.oContext + "/variantsEditable");
		oBinding.attachChange(function(oData) {
			if (oData && oData.oSource && oData.oSource.oModel && oData.oSource.sPath) {
				var oInnerModel;
				var bFlag = oData.oSource.oModel.getProperty(oData.oSource.sPath);
				oInnerModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
				if (oInnerModel && (bFlag !== undefined)) {
					oInnerModel.setProperty("/editable", bFlag);
				}
			}
		}.bind(this));
	};


	VariantManagement.prototype._obtainControl = function(oEvent) {
		if (oEvent && oEvent.target && oEvent.target.id) {
			var sId = oEvent.target.id;
			var nPos = sId.indexOf("-inner");
			if (nPos > 0) {
				sId = sId.substring(0, nPos);
			}
			return sap.ui.getCore().byId(sId);
		}

		return null;
	};

	// clickable area
	VariantManagement.prototype.handleOpenCloseVariantPopover = function(oEvent) {
		if (!this.bPopoverOpen) {
			this._oCtrlRef = this._obtainControl(oEvent);
			this._openVariantList();
		} else if (this.oVariantPopOver && this.oVariantPopOver.isOpen()) {
			this.oVariantPopOver.close();
		} else if (this.getInErrorState() && this.oErrorVariantPopOver && this.oErrorVariantPopOver.isOpen()) {
			this.oErrorVariantPopOver.close();
		}
	};

	VariantManagement.prototype.getFocusDomRef = function() {
		return this.oVariantPopoverTrigger.getFocusDomRef();
	};

	VariantManagement.prototype.onclick = function(oEvent) {
		if (this.oVariantPopoverTrigger && !this.bPopoverOpen) {
			this.oVariantPopoverTrigger.focus();
		}
		this.handleOpenCloseVariantPopover(oEvent);
	};

	VariantManagement.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.F4 || oEvent.which === KeyCodes.SPACE || oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_UP || oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_DOWN) {
			this._oCtrlRef = this._obtainControl(oEvent);
			this._openVariantList();
		}
	};

	VariantManagement.prototype.onAfterRendering = function() {
		this.oVariantText.$().off("mouseover").on("mouseover", function() {
			this.oVariantPopoverTrigger.addStyleClass("sapUiFlVarMngmtTriggerBtnHover");
		}.bind(this));
		this.oVariantText.$().off("mouseout").on("mouseout", function() {
			this.oVariantPopoverTrigger.removeStyleClass("sapUiFlVarMngmtTriggerBtnHover");
		}.bind(this));
	};

	// ERROR LIST
	VariantManagement.prototype._openInErrorState = function() {
		var oVBox;

		if (!this.oErrorVariantPopOver) {
			oVBox = new VBox({
				fitContainer: true,
				alignItems: sap.m.FlexAlignItems.Center,
				items: [
					new Icon({
						size: "4rem",
						color: "lightgray",
						src: "sap-icon://message-error"
					}), new Title({
						titleStyle: sap.ui.core.TitleLevel.H2,
						text: this._oRb.getText("VARIANT_MANAGEMENT_ERROR_TEXT1")
					}), new Text({
						textAlign: sap.ui.core.TextAlign.Center,
						text: this._oRb.getText("VARIANT_MANAGEMENT_ERROR_TEXT2")
					})
				]
			});

			oVBox.addStyleClass("sapUiFlVarMngmtErrorPopover");

			this.oErrorVariantPopOver = new ResponsivePopover(this.getId() + "-errorpopover", {
				title: {
					path: "/popoverTitle",
					model: VariantManagement.INNER_MODEL_NAME
				},
				contentWidth: "400px",
				placement: PlacementType.VerticalPreferredBottom,
				content: [
					new Page(this.getId() + "-errorselpage", {
						showSubHeader: false,
						showNavButton: false,
						showHeader: false,
						content: [
							oVBox
						]
					})
				],
				afterOpen: function() {
					this.bPopoverOpen = true;
				}.bind(this),
				afterClose: function() {
					if (this.bPopoverOpen) {
						setTimeout(function() {
							this.bPopoverOpen = false;
						}.bind(this), 200);
					}
				}.bind(this),
				contentHeight: "300px"
			});

			this.oErrorVariantPopOver.attachBrowserEvent("keyup", function(e) {
				if (e.which === 32) { // UP
					this.oErrorVariantPopOver.close();
				}
			}.bind(this));
		}

		if (this.bPopoverOpen) {
			return;
		}

		this.oErrorVariantPopOver.openBy(this.oVariantLayout);
	};

	// My Views List
	VariantManagement.prototype._createVariantList = function() {
		if (this.oVariantPopOver) {
			return;
		}

		this.oVariantManageBtn = new Button(this.getId() + "-manage", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_MANAGE"),
			enabled: true,
			press: function() {
				this._openManagementDialog();
			}.bind(this),
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			})
		});

		this.oVariantSaveBtn = new Button(this.getId() + "-mainsave", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
			press: function() {
				this._handleVariantSave();
			}.bind(this),
			visible: {
				path: "modified",
				model: this._sModelName,
				formatter: function(bValue) {
					return bValue;
				}
			},
			type: ButtonType.Emphasized,
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			})
		});

		this.oVariantSaveAsBtn = new Button(this.getId() + "-saveas", {
			text: this._oRb.getText("VARIANT_MANAGEMENT_SAVEAS"),
			press: function() {
				this._openSaveAsDialog();
			}.bind(this),
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}),
			visible: {
				path: "/showSaveAs",
				model: VariantManagement.INNER_MODEL_NAME
			}
		});

		this._oVariantList = new SelectList(this.getId() + "-list", {
			selectedKey: {
				path: "currentVariant",
				model: this._sModelName
			},
			itemPress: function(oEvent) {
				var sSelectionKey = null;
				if (oEvent && oEvent.getParameters()) {
					var oItemPressed = oEvent.getParameters().item;
					if (oItemPressed) {
						sSelectionKey = oItemPressed.getKey();
					}
				}
				if (sSelectionKey) {
					// this.setModified(false);
					this.setCurrentVariantKey(sSelectionKey);

					this.fireEvent("select", {
						key: sSelectionKey
					});
					this.oVariantPopOver.close();
				}
			}.bind(this)
		});
		this._oVariantList.setNoDataText(this._oRb.getText("VARIANT_MANAGEMENT_NODATA"));

		var oItemTemplate = new sap.ui.core.Item({
			key: '{' + this._sModelName + ">key}",
			text: '{' + this._sModelName + ">title}"
		});

		this._oVariantList.bindAggregation("items", {
			path: "variants",
			model: this._sModelName,
			template: oItemTemplate
		});

		this._oSearchField = new SearchField(this.getId() + "-search");
		this._oSearchField.attachLiveChange(function(oEvent) {
			this._triggerSearch(oEvent, this._oVariantList);
		}.bind(this));

		this.oVariantSelectionPage = new Page(this.getId() + "-selpage", {
			subHeader: new Toolbar({
				content: [
					this._oSearchField
				]
			}),
			content: [
				this._oVariantList
			],
			footer: new OverflowToolbar({
				content: [
					new ToolbarSpacer(this.getId() + "-spacer"), this.oVariantSaveBtn, this.oVariantSaveAsBtn, this.oVariantManageBtn
				]
			}),
			showNavButton: false,
			showHeader: false,
			showFooter: {
				path: "/editable",
				model: VariantManagement.INNER_MODEL_NAME
			}
		});

		this.oVariantPopOver = new ResponsivePopover(this.getId() + "-popover", {
			title: {
				path: "/popoverTitle",
				model: VariantManagement.INNER_MODEL_NAME
			},
			titleAlignment: "Auto",
			contentWidth: "400px",
			placement: PlacementType.VerticalPreferredBottom,
			content: [
				this.oVariantSelectionPage
			],
			afterOpen: function() {
				this.bPopoverOpen = true;
				this.oVariantPopoverTrigger.setPressed(true);
			}.bind(this),
			afterClose: function() {
				this.oVariantPopoverTrigger.setPressed(false);
				if (this.bPopoverOpen) {
					setTimeout(function() {
						this.bPopoverOpen = false;
					}.bind(this), 200);
				}
			}.bind(this),
			contentHeight: "300px"
		});

		this.oVariantPopOver.addStyleClass("sapUiFlVarMngmtPopover");
		if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
			this.oVariantPopOver.addStyleClass("sapUiSizeCompact");
		}
		this.addDependent(this.oVariantPopOver);

		// this._oVariantList.getBinding("items").filter(this._getFilters());
	};

	/**
	 * Hide or show <i>Save</i> button and emphasize "most positive action" - either <i>Save</i> button if it is visible, or <i>Save As</i> button if <i>Save</i> is hidden.
	 * @param {boolean} bShow - Indicator if <i>Save</i> button should be visible
	 * @private
	 */
	VariantManagement.prototype.showSaveButton = function(bShow) {
		if (bShow === false) {
			this.oVariantSaveAsBtn.setType(ButtonType.Emphasized);
			this.oVariantSaveBtn.setVisible(false);
		} else {
			this.oVariantSaveAsBtn.setType(ButtonType.Default);
			this.oVariantSaveBtn.setVisible(true);
		}
	};

	VariantManagement.prototype._openVariantList = function() {
		var oItem;

		if (this.getInErrorState()) {
			this._openInErrorState();
			return;
		}

		if (this.bPopoverOpen) {
			return;
		}

		// proceed only if context is available
		if (!this.oContext) {
			return;
		}

		this._createVariantList();
		this._oSearchField.setValue("");

		this._oVariantList.getBinding("items").filter(this._getFilters());

		this.oVariantSelectionPage.setShowSubHeader(this._oVariantList.getItems().length > 9);

		this.showSaveButton(false);

		if (this.getModified()) {
			oItem = this._getItemByKey(this.getCurrentVariantKey());
			if (oItem && oItem.change) {
				this.showSaveButton(true);
			}
		}

		var oControlRef = this._oCtrlRef ? this._oCtrlRef : this.oVariantLayout;
		this._oCtrlRef = null;
		this.oVariantPopOver.openBy(oControlRef);
	};

	VariantManagement.prototype._triggerSearch = function(oEvent, oVariantList) {
		if (!oEvent) {
			return;
		}

		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		var sValue = parameters.newValue ? parameters.newValue : "";

		var oFilter = new Filter({
			path: "title",
			operator: FilterOperator.Contains,
			value1: sValue
		});

		oVariantList.getBinding("items").filter(this._getFilters(oFilter));
	};

	// Save View dialog

	VariantManagement.prototype._createSaveAsDialog = function() {
		if (!this.oSaveAsDialog) {
			this.oInputName = new Input(this.getId() + "-name", {
				liveChange: function() {
					this._checkVariantNameConstraints(this.oInputName);
				}.bind(this)
			});

			var oLabelName = new Label(this.getId() + "-namelabel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_NAME")
			});
			oLabelName.setLabelFor(this.oInputName);
			oLabelName.addStyleClass("sapUiFlVarMngmtSaveDialogLabel");

			this.oDefault = new CheckBox(this.getId() + "-default", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SETASDEFAULT"),
				visible: {
					path: "/showSetAsDefault",
					model: VariantManagement.INNER_MODEL_NAME
				},
				width: "100%"
			});

			this.oPublic = new CheckBox(this.getId() + "-public", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SETASPUBLIC"),
				visible: {
					path: "/showPublic",
					model: VariantManagement.INNER_MODEL_NAME
				},
				width: "100%"
			});

			this.oExecuteOnSelect = new CheckBox(this.getId() + "-execute", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT"),
				visible: {
					path: "/showExecuteOnSelection",
					model: VariantManagement.INNER_MODEL_NAME
				},
				width: "100%"
			});

			this.oInputManualKey = new Input(this.getId() + "-key", {
				liveChange: function() {
					this._checkVariantNameConstraints(this.oInputManualKey);
				}.bind(this)
			});

			this.oLabelKey = new Label(this.getId() + "-keylabel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_KEY"),
				required: true
			});
			this.oLabelKey.setLabelFor(this.oInputManualKey);

			this.oSaveSave = new Button(this.getId() + "-variantsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
				type: ButtonType.Emphasized,
				press: function() {
					if (!this._bSaveOngoing) {
						this._checkVariantNameConstraints(this.oInputName);

						if (this.oInputName.getValueState() === "Error") {
							this.oInputName.focus();
							return;
						}

						this._bSaveOngoing = true;
						this._bSaveCanceled = false;
						this._handleVariantSaveAs(this.oInputName.getValue());
					}
				}.bind(this),
				enabled: true
			});
			var oSaveAsDialogOptionsGrid = new Grid({
				defaultSpan: "L12 M12 S12"
			});

			if (this.getShowSetAsDefault()) {
				oSaveAsDialogOptionsGrid.addContent(this.oDefault);
			}


			oSaveAsDialogOptionsGrid.addContent(this.oPublic);

			if (this._getShowExecuteOnSelection()) {
				oSaveAsDialogOptionsGrid.addContent(this.oExecuteOnSelect);
			}

			this.oSaveAsDialog = new Dialog(this.getId() + "-savedialog", {
				title: this._oRb.getText("VARIANT_MANAGEMENT_SAVEDIALOG"),
				afterClose: function() {
					this._bSaveOngoing = false;

					if (this._sStyleClass) {
						this._setShowPublic(this._bShowPublic);
						this.oSaveAsDialog.removeStyleClass(this._sStyleClass);

						if (this._oRolesComponentContainer) {
							this.oSaveAsDialog.removeContent(this._oRolesComponentContainer);
						}

						this._sStyleClass = undefined;
						this._oRolesComponentContainer = null;
					}
				}.bind(this),
				beginButton: this.oSaveSave,
				endButton: new Button(this.getId() + "-variantcancel", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: this._cancelPressed.bind(this)
				}),
				content: [
					oLabelName, this.oInputName, this.oLabelKey, this.oInputManualKey, oSaveAsDialogOptionsGrid
				],
				stretch: Device.system.phone
			});

			this.oSaveAsDialog.isPopupAdaptationAllowed = function() {
				return false;
			};

			this.oSaveAsDialog.addStyleClass("sapUiContentPadding");
			this.oSaveAsDialog.addStyleClass("sapUiFlVarMngmtSaveDialog");

			if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
				this.oSaveAsDialog.addStyleClass("sapUiSizeCompact");
			}

			this.addDependent(this.oSaveAsDialog);
		}
	};

	VariantManagement.prototype._cancelPressed = function() {
		this._bSaveCanceled = true;

		this.fireCancel();
		this.oSaveAsDialog.close();
	};


	VariantManagement.prototype._getSelectedContexts = function() {
		return this._oRolesComponentContainer.getComponentInstance().getSelectedContexts();
	};
	VariantManagement.prototype._setSelectedContexts = function(mContexts) {
		if (!mContexts) {
			mContexts = { role: []};
		}
		this._oRolesComponentContainer.getComponentInstance().setSelectedContexts(mContexts);
	};

	VariantManagement.prototype._isInErrorContexts = function() {
		return this._oRolesComponentContainer.getComponentInstance().hasErrorsAndShowErrorMessage();
	};

	VariantManagement.prototype._determineRolesSpecificText = function(mContexts, oTextControl) {
		if (!mContexts) {
			mContexts = { role: []};
		}
		if (mContexts && oTextControl) {
			oTextControl.setText(this._oRb.getText((mContexts.role && mContexts.role.length > 0) ? "VARIANT_MANAGEMENT_VISIBILITY_RESTRICTED" : "VARIANT_MANAGEMENT_VISIBILITY_NON_RESTRICTED"));
		}
	};

	VariantManagement.prototype._checkAndAddRolesContainerToManageDialog = function() {
		if (this._oRolesComponentContainer && this._oRolesDialog) {
			var oRolesComponentContainer = null;
			this._oRolesDialog.getContent().some(function(oContent) {
				if (oContent === this._oRolesComponentContainer) {
					oRolesComponentContainer = oContent;
					return true;
				}

				return false;
			}.bind(this));

			if (!oRolesComponentContainer) {
				this._oRolesDialog.addContent(this._oRolesComponentContainer);
			}
		}
	};

	VariantManagement.prototype._createRolesDialog = function() {
		if (!this._oRolesDialog) {
			this._oRolesDialog = new Dialog(this.getId() + "-roledialog", {
				draggable: true,
				resizable: true,
				contentWidth: "40%",
				title: this._oRb.getText("VARIANT_MANAGEMENT_SELECTROLES_DIALOG"),
				beginButton: new Button(this.getId() + "-rolesave", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
					type: ButtonType.Emphasized,
					press: function() {
						if (!this._checkAndCreateContextInfoChanges(this._oCurrentContextsKey, this._oTextControl)) {
							return;
						}
						this._oRolesDialog.close();
					}.bind(this)
				}),
				endButton: new Button(this.getId() + "-rolecancel", {
					text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: function() {
						this._oRolesDialog.close();
					}.bind(this)
				}),
				content: [this._oRolesComponentContainer],
				stretch: Device.system.phone
			});

			this._oRolesDialog.setParent(this);
			this._oRolesDialog.addStyleClass("sapUiContentPadding");
			this._oRolesDialog.addStyleClass(this._sStyleClass);

			this._oRolesDialog.isPopupAdaptationAllowed = function() {
				return false;
			};
		}

		this._checkAndAddRolesContainerToManageDialog();
	};

	VariantManagement.prototype._openRolesDialog = function(oItem, oTextControl) {
		this._createRolesDialog();

		this._oCurrentContextsKey = oItem.key;
		this._oTextControl = oTextControl;

		this._setSelectedContexts(oItem.contexts);

		this._oRolesDialog.open();
	};

	VariantManagement.prototype._checkAndCreateContextInfoChanges = function(sKey, oTextControl) {
		if (sKey) {
			if (this._oRolesComponentContainer) {
				try {
					if (!this._isInErrorContexts()) {
						var mContexts = this._getSelectedContexts();

						var oItem = this._getItemByKey(sKey);
						if (oItem) {
							oItem.contexts = mContexts;
							this._determineRolesSpecificText(mContexts, oTextControl);
						}
					} else {
						return false;
					}
				} catch (ex) {
					return false;
				}
			}
			return true;
		}
		return false;
	};

	VariantManagement.prototype._checkAndAddRolesContainerToSaveAsDialog = function() {
		if (this._oRolesComponentContainer && this.oSaveAsDialog) {
			var oRolesComponentContainer = null;
			this.oSaveAsDialog.getContent().some(function(oContent) {
				if (oContent === this._oRolesComponentContainer) {
					oRolesComponentContainer = oContent;
					return true;
				}

				return false;
			}.bind(this));

			this._setSelectedContexts({ role: []});
			if (!oRolesComponentContainer) {
				this.oSaveAsDialog.addContent(this._oRolesComponentContainer);
			}
		}
	};

	/**
	 * Opens the <i>Save As</i> dialog.
	 * @param {string} sRtaStyleClassName - style-class to be used
	 * @param {object} oRolesComponentContainer - component for roles handling
	 */
	VariantManagement.prototype.openSaveAsDialogForKeyUser = function (sRtaStyleClassName, oRolesComponentContainer) {
		this._openSaveAsDialog(true);
		this.oSaveAsDialog.addStyleClass(sRtaStyleClassName);
		this._sStyleClass = sRtaStyleClassName; // indicates that dialog is running in key user scenario

		this._bShowPublic = this._getShowPublic();
		this._setShowPublic(false);

		if (oRolesComponentContainer) {
			Promise.all([oRolesComponentContainer]).then(function(vArgs) {
				this._oRolesComponentContainer = vArgs[0];
				this._checkAndAddRolesContainerToSaveAsDialog();

				this.oSaveAsDialog.open();
			}.bind(this));
		} else {
			this.oSaveAsDialog.open();
		}
	};

	VariantManagement.prototype._openSaveAsDialog = function(bDoNotOpen) {
		this._createSaveAsDialog();

		this.oInputName.setValue(this.getSelectedVariantText(this.getCurrentVariantKey()));
		this.oInputName.setEnabled(true);
		this.oInputName.setValueState(ValueState.None);
		this.oInputName.setValueStateText(null);

		this.oDefault.setSelected(false);
		this.oPublic.setSelected(false);
		this.oExecuteOnSelect.setSelected(false);

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		if (this.getManualVariantKey()) {
			this.oInputManualKey.setVisible(true);
			this.oInputManualKey.setEnabled(true);
			this.oInputManualKey.setValueState(ValueState.None);
			this.oInputManualKey.setValueStateText(null);
			this.oLabelKey.setVisible(true);
		} else {
			this.oInputManualKey.setVisible(false);
			this.oLabelKey.setVisible(false);
		}

		if (!bDoNotOpen) {
			this.oSaveAsDialog.open();
		}
	};

	VariantManagement.prototype._handleVariantSaveAs = function(sNewVariantName) {
		var sKey = null;
		var sName = sNewVariantName.trim();
		var sManualKey = this.oInputManualKey.getValue().trim();

		if (sName === "") {
			this.oInputName.setValueState(ValueState.Error);
			this.oInputName.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			return;
		}

		if (this.getManualVariantKey()) {
			if (sManualKey === "") {
				this.oInputManualKey.setValueState(ValueState.Error);
				this.oInputManualKey.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
				return;
			}
			sKey = sManualKey;
		}

		if (this.oSaveAsDialog) {
			this.oSaveAsDialog.close();
		}

		if (this.oDefault.getSelected()) {
			this.setDefaultVariantKey(sKey);
		}

		this.setModified(false);

		this.fireSave({
			key: sKey, // is null
			name: sName,
			overwrite: false,
			def: this.oDefault.getSelected(),
			execute: this.oExecuteOnSelect.getSelected(),
			"public": this._sStyleClass ? undefined : this.oPublic.getSelected(),
			contexts: this._sStyleClass ? this._getContextInfoChanges() : undefined
		});
	};

	VariantManagement.prototype._getContextInfoChanges = function() {
		if (this._oRolesComponentContainer) {
			try {
				if (!this._isInErrorContexts()) {
					return this._getSelectedContexts();
				}
			} catch (ex) {
				return null;
			}
		}

		return null;
	};

	VariantManagement.prototype._handleVariantSave = function() {
		var oItem = this._getItemByKey(this.getCurrentVariantKey());

		var bDefault = false;
		if (this.getDefaultVariantKey() === oItem.key) {
			bDefault = true;
		}

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this.fireSave({
			name: oItem.title,
			overwrite: true,
			key: oItem.key,
			def: bDefault
		});

		this.setModified(false);
	};

	// Manage Views dialog

	/**
	 * Opens the <i>Manage Views</i> dialog.
	 * @param {boolean} bCreateAlways - Indicates that if this is set to <code>true</code>, the former dialog will be destroyed before a new one is created
	 * @param {string} sClass - style-class to be used
	 * @param {object} oRolesComponentContainer - component for roles handling
	 */
	VariantManagement.prototype.openManagementDialog = function(bCreateAlways, sClass, oRolesComponentContainer) {
		if (bCreateAlways && this.oManagementDialog) {
			this.oManagementDialog.destroy();
			this.oManagementDialog = undefined;
		}

		if (sClass) {
			this._sStyleClass = sClass;
			this._bShowPublic = this._getShowPublic();
			this._setShowPublic(false);
		}

		if (oRolesComponentContainer) {
			Promise.all([oRolesComponentContainer]).then(function(vArgs) {
				this._oRolesComponentContainer = vArgs[0];

				this._setShowContexts(!!this._oRolesComponentContainer);
				this._openManagementDialog();

				if (this._sStyleClass) {
					this.oManagementDialog.addStyleClass(this._sStyleClass);
				}
			}.bind(this));
		} else {
			this._setShowContexts(false);
			this._openManagementDialog();

			if (this._sStyleClass) {
				this.oManagementDialog.addStyleClass(this._sStyleClass);
			}
		}
	};

	VariantManagement.prototype._triggerSearchInManageDialog = function(oEvent, oManagementTable) {
		if (!oEvent) {
			return;
		}

		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		var sValue = parameters.newValue ? parameters.newValue : "";

		var aFilters = [
			this._getVisibleFilter(), new Filter({
				filters: [
					new Filter({
						path: "title",
						operator: FilterOperator.Contains,
						value1: sValue
					}), new Filter({
						path: "author",
						operator: FilterOperator.Contains,
						value1: sValue
					})
				],
				and: false
			})
		];

		oManagementTable.getBinding("items").filter(aFilters);

		this._bDeleteOccured = true;
	};

	VariantManagement.prototype.getManageDialog = function() {
		return this.oManagementDialog;
	};

	VariantManagement.prototype._createManagementDialog = function() {
		if (!this.oManagementDialog || this.oManagementDialog.bIsDestroyed) {
			this.oManagementTable = new Table(this.getId() + "-managementTable", {
				contextualWidth: "Auto",
				fixedLayout: false,
				growing: true,
				columns: [
					new Column({
						width: "3rem",
						visible: {
							path: "showFavorites",
							model: this._sModelName
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_NAME")
						}),
						width: "16rem"
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_VARIANTTYPE"),
							wrappingType: "Hyphenated"
						}),
						visible: {
							path: "/showPublic",
							model: VariantManagement.INNER_MODEL_NAME
						},
						demandPopin: true,
						popinDisplay: PopinDisplay.Inline,
						minScreenWidth: ScreenSize.Tablet
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_DEFAULT"),
							wrappingType: "Hyphenated"
						}),
						hAlign: TextAlign.Center,
						demandPopin: true,
						popinDisplay: PopinDisplay.Block,
						minScreenWidth: ScreenSize.Tablet,
						visible: {
							path: "/showSetAsDefault",
							model: VariantManagement.INNER_MODEL_NAME
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT"),
							wrappingType: "Hyphenated"
						}),
						hAlign: this.getDisplayTextForExecuteOnSelectionForStandardVariant() ? TextAlign.Begin : TextAlign.Center,
						demandPopin: true,
						popinDisplay: PopinDisplay.Block,
						minScreenWidth: ScreenSize.Tablet,
						visible: {
							path: "/showExecuteOnSelection",
							model: VariantManagement.INNER_MODEL_NAME
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_VISIBILITY"),
							wrappingType: "Hyphenated"
						}),
						width: "8rem",
						demandPopin: true,
						popinDisplay: PopinDisplay.Inline,
						minScreenWidth: ScreenSize.Tablet,
						visible: {
							path: "/showContexts",
							model: VariantManagement.INNER_MODEL_NAME
						}
					}), new Column({
						header: new Text({
							text: this._oRb.getText("VARIANT_MANAGEMENT_AUTHOR")
						}),
						demandPopin: true,
						popinDisplay: PopinDisplay.Block,
						minScreenWidth: ScreenSize.Tablet
					}), new Column({
						hAlign: TextAlign.Center
					}), new Column({
						visible: false
					})
				]
			});

			this.oManagementSave = new Button(this.getId() + "-managementsave", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
				enabled: true,
				type: ButtonType.Emphasized,
				press: function() {
					this._handleManageSavePressed();
				}.bind(this)
			});

			this.oManagementCancel = new Button(this.getId() + "-managementcancel", {
				text: this._oRb.getText("VARIANT_MANAGEMENT_CANCEL"),
				press: function() {
					this._resumeManagementTableBinding();
					this.oManagementDialog.close();
					this._handleManageCancelPressed();
				}.bind(this)
			});

			this.oManagementDialog = new Dialog(this.getId() + "-managementdialog", {
				contentWidth: "64%",
				resizable: true,
				draggable: true,
				title: this._oRb.getText("VARIANT_MANAGEMENT_MANAGEDIALOG"),
				beginButton: this.oManagementSave,
				endButton: this.oManagementCancel,
				afterClose: function() {
					if (this._sStyleClass) {
						this._setShowPublic(this._bShowPublic);
						this.oManagementDialog.removeStyleClass(this._sStyleClass);
						this._sStyleClass = undefined;
						this._oRolesComponentContainer = null;
					}
				}.bind(this),
				content: [
					this.oManagementTable
				],
				stretch: Device.system.phone
			});

			// add marker
			this.oManagementDialog.isPopupAdaptationAllowed = function() {
				return false;
			};

			this._oSearchFieldOnMgmtDialog = new SearchField();
			this._oSearchFieldOnMgmtDialog.attachLiveChange(function(oEvent) {
				this._triggerSearchInManageDialog(oEvent, this.oManagementTable);
			}.bind(this));

			var oSubHeader = new Bar(this.getId() + "-mgmHeaderSearch", {
				contentMiddle: [
					this._oSearchFieldOnMgmtDialog
				]
			});
			this.oManagementDialog.setSubHeader(oSubHeader);

			if (this.oVariantLayout.$().closest(".sapUiSizeCompact").length > 0) {
				this.oManagementDialog.addStyleClass("sapUiSizeCompact");
			}
			this.addDependent(this.oManagementDialog);

			this.oManagementTable.bindAggregation("items", {
				path: "variants",
				model: this._sModelName,
				factory: this._templateFactoryManagementDialog.bind(this),
				filters: this._getVisibleFilter()
			});

			this._bDeleteOccured = false;
		}
	};

	VariantManagement.prototype._setFavoriteIcon = function(oIcon, bFlagged) {
		if (oIcon) {
			oIcon.setSrc(bFlagged ? "sap-icon://favorite" : "sap-icon://unfavorite");
			oIcon.setTooltip(this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_TOOLTIP" : "VARIANT_MANAGEMENT_FAV_ADD_TOOLTIP"));
			oIcon.setAlt(this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_ACC" : "VARIANT_MANAGEMENT_FAV_ADD_ACC"));
		}
	};

	VariantManagement.prototype._templateFactoryManagementDialog = function(sId, oContext) {
		var sTooltip = null;
		var oDeleteButton;
		var sBindingPath;
		var oNameControl;
		var oExecuteOnSelectCtrl;
		var oRolesCell;
		var oItem = oContext.getObject();
		if (!oItem) {
			return undefined;
		}

		var fLiveChange = function(oEvent) {
			this._checkVariantNameConstraints(oEvent.oSource, oEvent.oSource.getBindingContext(this._sModelName).getObject().key);
		}.bind(this);

		var fChange = function(oEvent) {
			this._handleManageTitleChanged(oEvent.oSource.getBindingContext(this._sModelName).getObject());
		}.bind(this);

		var fSelectRB = function(oEvent) {
			this._handleManageDefaultVariantChange(oEvent.oSource, oEvent.oSource.getBindingContext(this._sModelName).getObject(), oEvent.getParameters().selected);
		}.bind(this);

		var fSelectCB = function(oEvent) {
			this._handleManageExecuteOnSelectionChanged(oEvent.oSource.getBindingContext(this._sModelName).getObject());
		}.bind(this);

		var fPress = function(oEvent) {
			this._handleManageDeletePressed(oEvent.oSource.getBindingContext(this._sModelName).getObject());
			var oListItem = oEvent.oSource.getParent();
			if (oListItem) {
				oListItem.setVisible(false);
			}

			this._reCheckVariantNameConstraints();
		}.bind(this);

		var fSelectFav = function(oEvent) {
			this._handleManageFavoriteChanged(oEvent.oSource, oEvent.oSource.getBindingContext(this._sModelName).getObject());
		}.bind(this);

		var fRolesPressed = function(oEvent) {
			var oItem = oEvent.oSource.getBindingContext(this._sModelName).getObject();
			this._openRolesDialog(oItem, oEvent.oSource.getParent().getItems()[0]);
		}.bind(this);

		if (oItem.rename) {
			oNameControl = new Input({
				liveChange: fLiveChange,
				change: fChange,
				value: '{' + this._sModelName + ">title}"
			});
		} else {
			oNameControl = new ObjectIdentifier({
				title: '{' + this._sModelName + ">title}"
			});
			if (sTooltip) {
				oNameControl.setTooltip(sTooltip);
			}
		}

		oDeleteButton = new Button({
			icon: "sap-icon://decline",
			enabled: true,
			type: ButtonType.Transparent,
			press: fPress,
			tooltip: this._oRb.getText("VARIANT_MANAGEMENT_DELETE"),
			visible: oItem.remove
		});

		this._assignColumnInfoForDeleteButton(oDeleteButton);

		sBindingPath = this.oContext.getPath();

		var oFavoriteIcon = new Icon({
			src: {
				path: "favorite",
				model: this._sModelName,
				formatter: function(bFlagged) {
					return bFlagged ? "sap-icon://favorite" : "sap-icon://unfavorite";
				}
			},
			tooltip: {
				path: 'favorite',
				model: this._sModelName,
				formatter: function(bFlagged) {
					return this._oRb.getText(bFlagged ? "VARIANT_MANAGEMENT_FAV_DEL_TOOLTIP" : "VARIANT_MANAGEMENT_FAV_ADD_TOOLTIP");
				}.bind(this)
			},
			press: fSelectFav
		});

		if ((this.getStandardVariantKey() === oItem.key) || (this.getDefaultVariantKey() === oItem.key)) {
			oFavoriteIcon.addStyleClass("sapUiFlVarMngmtFavNonInteractiveColor");
		} else {
			oFavoriteIcon.addStyleClass("sapUiFlVarMngmtFavColor");
		}

		if (this.getDisplayTextForExecuteOnSelectionForStandardVariant() && (this.getStandardVariantKey() === oItem.key)) {
			oExecuteOnSelectCtrl = new CheckBox({
				wrapping: true,
				text: this.getDisplayTextForExecuteOnSelectionForStandardVariant(),
				select: fSelectCB,
				selected: '{' + this._sModelName + ">executeOnSelect}"
			});
		} else {
			oExecuteOnSelectCtrl = new CheckBox({
				text: "",
				select: fSelectCB,
				selected: '{' + this._sModelName + ">executeOnSelect}"
			});
		}

		// roles
		if (this._sStyleClass && (oItem.key !== this.getStandardVariantKey())) {
			var oText = new Text({ wrapping: false });
			this._determineRolesSpecificText(oItem.contexts, oText);
			var oIcon = new Icon({
				src: "sap-icon://edit",
				press: fRolesPressed
			});
			oIcon.addStyleClass("sapUiFlVarMngmtRolesEdit");
			oIcon.setTooltip(this._oRb.getText("VARIANT_MANAGEMENT_VISIBILITY_ICON_TT"));
			oRolesCell = new HBox({
				items: [oText, oIcon]
			});
		} else {
			oRolesCell = new Text();
		}

		return new ColumnListItem({
			cells: [
				oFavoriteIcon, oNameControl, new Text({
					text: {
						path: "sharing",
						model: this._sModelName,
						formatter: function(sValue) {
							return this._oRb.getText(sValue === "private" ? "VARIANT_MANAGEMENT_PRIVATE" : "VARIANT_MANAGEMENT_PUBLIC");
						}.bind(this)
					},
					textAlign: "Center"
				}), new RadioButton({
					groupName: this.getId(),
					select: fSelectRB,
					selected: {
						path: sBindingPath + "/defaultVariant",
						model: this._sModelName,
						formatter: function(sKey) {
							return oItem.key === sKey;
						}
					}
				}), oExecuteOnSelectCtrl, oRolesCell, new Text({
					text: '{' + this._sModelName + ">author}",
					textAlign: "Begin"
				}), oDeleteButton, new Text({
					text: '{' + this._sModelName + ">key}"
				})
			]
		});
	};

	VariantManagement.prototype._openManagementDialog = function() {
		this._createManagementDialog();

		if (this.oVariantPopOver) {
			this.oVariantPopOver.close();
		}

		this._suspendManagementTableBinding();

		this._clearDeletedItems();
		//		this.oManagementSave.setEnabled(false);
		this._oSearchFieldOnMgmtDialog.setValue("");

		// Ideally, this should be done only once in <code>_createtManagementDialog</code>. However, the binding does not recognize a change if filtering is involved.
		// After a deletion on the UI, the item is filtered out <code>.visible=false</code>. The real deletion will occur only when <i>OK</i> is pressed.
		// Since the filtered items and the result after the real deletion are identical, no change is detected. Based on this, the context on the table is
		// not invalidated....
		// WA: Always do the binding while opening the dialog.
		if (this._bDeleteOccured) {
			this._bDeleteOccured = false;
			this.oManagementTable.bindAggregation("items", {
				path: "variants",
				model: this._sModelName,
				factory: this._templateFactoryManagementDialog.bind(this),
				filters: this._getVisibleFilter()
			});
		}

		this.oManagementDialog.open();
	};

	VariantManagement.prototype._assignColumnInfoForDeleteButton = function(oDeleteButton) {
		if (!this._oInvisibleDeleteColumnName) {
			this._oInvisibleDeleteColumnName = new InvisibleText({
				text: this._oRb.getText("VARIANT_MANAGEMENT_ACTION_COLUMN")
			});

			this.oManagementDialog.addContent(this._oInvisibleDeleteColumnName);
		}

		if (this._oInvisibleDeleteColumnName) {
			oDeleteButton.addAriaLabelledBy(this._oInvisibleDeleteColumnName);
		}
	};

	VariantManagement.prototype._toggleIconActivityState = function(oIcon, oItem, bToInActive) {
		if (!oIcon) {
			return;
		}

		if (oItem.key === this.getStandardVariantKey()) {
			return;
		}

		if (bToInActive && oIcon.hasStyleClass("sapUiFlVarMngmtFavColor")) {
			oIcon.removeStyleClass("sapUiFlVarMngmtFavColor");
			oIcon.addStyleClass("sapUiFlVarMngmtFavNonInteractiveColor");
		} else if (oIcon.hasStyleClass("sapUiFlVarMngmtFavNonInteractiveColor")) {
			oIcon.removeStyleClass("sapUiFlVarMngmtFavNonInteractiveColor");
			oIcon.addStyleClass("sapUiFlVarMngmtFavColor");
		}
	};

	VariantManagement.prototype._handleManageDefaultVariantChange = function(oRadioButton, oItem, bSelected) {
		var sKey = oItem.key;

		if (oRadioButton) {
			var oIcon = oRadioButton.getParent().getCells()[VariantManagement.COLUMN_FAV_IDX];

			if (bSelected) {
				if (this.getShowFavorites() && !oItem.favorite) {
					oItem.favorite = true;
					this._setFavoriteIcon(oIcon, true);
				}

				this.setDefaultVariantKey(sKey);
			}

			this._toggleIconActivityState(oIcon, oItem, bSelected);
		}
	};

	VariantManagement.prototype._handleManageCancelPressed = function() {
		var sDefaultVariantKey;
		var oModel;
		this._getDeletedItems().forEach(function(oItem) {
			oItem.visible = true;
		});

		this._getItems().forEach(function(oItem) {
			oItem.title = oItem.originalTitle;
			oItem.favorite = oItem.originalFavorite;
			oItem.executeOnSelection = oItem.originalExecuteOnSelection;
			oItem.contexts = oItem.originalContexts;
		});

		sDefaultVariantKey = this.getOriginalDefaultVariantKey();
		if (sDefaultVariantKey !== this.getDefaultVariantKey()) {
			this.setDefaultVariantKey(sDefaultVariantKey);
		}

		oModel = this.getModel(this._sModelName);
		if (oModel) {
			oModel.checkUpdate();
		}
	};

	VariantManagement.prototype._handleManageFavoriteChanged = function(oIcon, oItem) {
		//		if (!this._anyInErrorState(this.oManagementTable)) {
		//			this.oManagementSave.setEnabled(true);
		//		}
		if (this.getStandardVariantKey() === oItem.key) {
			return;
		}

		if ((this.getDefaultVariantKey() === oItem.key) && oItem.favorite) {
			return;
		}

		oItem.favorite = !oItem.favorite;
		this._setFavoriteIcon(oIcon, oItem.favorite);
	};

	VariantManagement.prototype._getRowForKey = function(sKey) {
		var oRowForKey = null;
		if (this.oManagementTable) {
			this.oManagementTable.getItems().some(function(oRow) {
				if (sKey === oRow.getCells()[0].getBindingContext(this._sModelName).getObject().key) {
					oRowForKey = oRow;
				}

				return oRowForKey !== null;
			}.bind(this));
		}

		return oRowForKey;
	};

	VariantManagement.prototype._handleManageDeletePressed = function(oItem) {
		var oModel;
		var sKey = oItem.key;

		// do not allow the deletion of the standard
		if (this.getStandardVariantKey() === sKey) {
			return;
		}

		oItem.visible = false;
		this._addDeletedItem(oItem);

		if ((sKey === this.getDefaultVariantKey())) {
			this.setDefaultVariantKey(this.getStandardVariantKey());
			if (this.getShowFavorites()) {
				var oNewDefaultItem = this._getItemByKey(this.getStandardVariantKey());
				if (oNewDefaultItem && !oNewDefaultItem.favorite) {
					var oRow = this._getRowForKey(this.getStandardVariantKey());
					if (oRow) {
						oNewDefaultItem.favorite = true;
						this._setFavoriteIcon(oRow.getCells()[VariantManagement.COLUMN_FAV_IDX], true);
					}
				}
			}
		}

		oModel = this.getModel(this._sModelName);
		if (oModel) {
			oModel.checkUpdate();
		}

		this.oManagementCancel.focus();
	};

	VariantManagement.prototype._handleManageExecuteOnSelectionChanged = function() {
		//		if (!this._anyInErrorState(this.oManagementTable)) {
		//			this.oManagementSave.setEnabled(true);
		//		}
	};

	VariantManagement.prototype._handleManageTitleChanged = function() {
		//		if (!this._anyInErrorState(this.oManagementTable)) {
		//			this.oManagementSave.setEnabled(true);
		//		}
	};

	VariantManagement.prototype._handleManageSavePressed = function() {
		if (this._anyInErrorState(this.oManagementTable)) {
			return;
		}

		this._getDeletedItems().some(function(oItem) {
			if (oItem.key === this.getCurrentVariantKey()) {
				var sKey = this.getStandardVariantKey();

				this.setModified(false);
				this.setCurrentVariantKey(sKey);

				this.fireEvent("select", {
					key: sKey
				});
				return true;
			}

			return false;
		}.bind(this));

		this.fireManage();

		this._resumeManagementTableBinding();
		this.oManagementDialog.close();
	};

	VariantManagement.prototype._resumeManagementTableBinding = function() {
		if (this.oManagementTable) {
			var oListBinding = this.oManagementTable.getBinding("items");
			if (oListBinding) {
				oListBinding.resume();
			}
		}
	};

	VariantManagement.prototype._suspendManagementTableBinding = function() {
		if (this.oManagementTable) {
			var oListBinding = this.oManagementTable.getBinding("items");
			if (oListBinding) {
				oListBinding.suspend();
			}
		}
	};

	VariantManagement.prototype._anyInErrorState = function(oManagementTable) {
		var aItems;
		var oInput;
		var bInError = false;

		if (oManagementTable) {
			aItems = oManagementTable.getItems();
			aItems.some(function(oItem) {
				oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
				if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
					bInError = true;
				}
				return bInError;
			});
		}

		return bInError;
	};

	// UTILS

	VariantManagement.prototype._getFilters = function(oFilter) {
		var aFilters = [];

		if (oFilter) {
			aFilters.push(oFilter);
		}

		aFilters.push(this._getVisibleFilter());

		if (this.getShowFavorites()) {
			aFilters.push(this._getFilterFavorites());
		}

		return aFilters;
	};

	VariantManagement.prototype._getVisibleFilter = function() {
		return new Filter({
			path: "visible",
			operator: FilterOperator.EQ,
			value1: true
		});
	};

	VariantManagement.prototype._getFilterFavorites = function() {
		return new Filter({
			path: "favorite",
			operator: FilterOperator.EQ,
			value1: true
		});
	};


	VariantManagement.prototype._verifyVariantNameConstraints = function(oInputField, sKey) {
		if (!oInputField) {
			return;
		}

		var sValue = oInputField.getValue();
		sValue = sValue.trim();

		if (!this._checkIsDuplicate(sValue, sKey)) {
			if (sValue === "") {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			} else if (sValue.indexOf('{') > -1) {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_NOT_ALLOWED_CHAR", [
					"{"
				]));
			} else if (sValue.length > VariantManagement.MAX_NAME_LEN) {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_MAX_LEN", [
					VariantManagement.MAX_NAME_LEN
				]));
			} else {
				oInputField.setValueState(ValueState.None);
				oInputField.setValueStateText(null);
			}
		} else {
			oInputField.setValueState(ValueState.Error);
			oInputField.setValueStateText(this._oRb.getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE"));
		}
	};

	VariantManagement.prototype._checkVariantNameConstraints = function(oInputField, sKey) {
		this._verifyVariantNameConstraints(oInputField, sKey);

		if (this.oManagementDialog && this.oManagementDialog.isOpen()) {
			this._reCheckVariantNameConstraints();
		}
	};

	VariantManagement.prototype._reCheckVariantNameConstraints = function() {
		var aItems;
		var bInError = false;

		if (this.oManagementTable) {
			aItems = this.oManagementTable.getItems();
			aItems.some(function(oItem) {
				var oObject = oItem.getBindingContext(this._sModelName).getObject();
				if (oObject && oObject.visible) {
					var oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
					if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
						this._verifyVariantNameConstraints(oInput, oObject.key);
						if (oInput.getValueState() === ValueState.Error) {
							bInError = true;
						}
					}
				}

				return bInError;
			}.bind(this));
		}

		return bInError;
	};

	VariantManagement.prototype._checkIsDuplicate = function(sValue, sKey) {
		if (this.oManagementDialog && this.oManagementDialog.isOpen()) {
			return this._checkIsDuplicateInManageTable(sValue, sKey);
		}

		return this._checkIsDuplicateInModel(sValue, sKey);
	};

	VariantManagement.prototype._checkIsDuplicateInModel = function(sValue, sKey) {
		var bDublicate = false;
		var aItems = this._getItems();
		var sLowerCaseValue = sValue.toLowerCase();
		aItems.some(function(oItem) {
			if (oItem.title.toLowerCase() === sLowerCaseValue) {
				if (sKey && (sKey === oItem.key)) {
					return false;
				}
				bDublicate = true;
			}

			return bDublicate;
		});

		return bDublicate;
	};

	VariantManagement.prototype._checkIsDuplicateInManageTable = function(sValue, sKey) {
		var aItems;
		var bInError = false;
		var sLowerCaseValue = sValue.toLowerCase();

		if (this.oManagementTable) {
			aItems = this.oManagementTable.getItems();
			aItems.some(function(oItem) {
				var sTitleLowerCase;
				var oObject = oItem.getBindingContext(this._sModelName).getObject();
				if (oObject && oObject.visible) {
					var oInput = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];

					if (oInput && (oObject.key !== sKey)) {
						if (oInput.isA("sap.m.Input")) {
							sTitleLowerCase = oInput.getValue().toLowerCase();
						} else {
							sTitleLowerCase = oInput.getTitle().toLowerCase();
						}
						if (sTitleLowerCase === sLowerCaseValue) {
							bInError = true;
						}
					}
				}
				return bInError;
			}.bind(this));
		}

		return bInError;
	};

	// exit destroy all controls created in init
	VariantManagement.prototype.exit = function() {
		var oModel;

		if (this.oVariantInvisibleText) {
			this.oVariantInvisibleText.destroy(true);
			this.oVariantInvisibleText = undefined;
		}

		if (this.oDefault && !this.oDefault._bIsBeingDestroyed) {
			this.oDefault.destroy();
		}
		this.oDefault = undefined;

		if (this.oPublic && !this.oPublic._bIsBeingDestroyed) {
			this.oPublic.destroy();
		}
		this.oPublic = undefined;

		if (this.oExecuteOnSelect && !this.oExecuteOnSelect._bIsBeingDestroyed) {
			this.oExecuteOnSelect.destroy();
		}
		this.oExecuteOnSelect = undefined;
		this._oRb = undefined;

		this.oContext = undefined;

		this._oVariantList = undefined;
		this.oVariantSelectionPage = undefined;
		this.oVariantLayout = undefined;
		this.oVariantText = undefined;
		this.oVariantModifiedText = undefined;
		this.oVariantPopoverTrigger = undefined;
		this._oSearchField = undefined;
		this._oSearchFieldOnMgmtDialog = undefined;

		oModel = this.getModel(VariantManagement.INNER_MODEL_NAME);
		if (oModel) {
			oModel.destroy();
		}

		this._oRolesComponentContainer = null;
		this._sStyleClass = null;

		this._fRegisteredApplyAutomaticallyOnStandardVariant = null;

		if (this._oRolesDialog) {
			this._oRolesDialog.destroy();
			this._oRolesDialog = null;
		}
	};

	return VariantManagement;
});