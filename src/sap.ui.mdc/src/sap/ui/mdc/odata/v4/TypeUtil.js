/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/mdc/odata/TypeUtil', 'sap/ui/mdc/enum/BaseType'], function(ODataTypeUtil, BaseType) {
	"use strict";

	/**
	 * Provides mapping functionality for odata v4 data types to base types. Extend this object in your project to customize behaviour depending on model usage.
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @experimental As of version 1.79
	 * @since 1.79.0
	 * @alias sap.ui.mdc.odata.v4.TypeUtil
	 */
	var ODataV4TypeUtil = Object.assign({}, ODataTypeUtil);

	ODataV4TypeUtil.getBaseType = function(sType, oFormatOptions, oConstraints) {

		switch (sType) {
			case "sap.ui.model.odata.type.Date":
				return BaseType.Date;

			case "sap.ui.model.odata.type.TimeOfDay":
				return BaseType.Time;

			case "sap.ui.model.odata.type.Unit":
			case "sap.ui.model.odata.type.Currency":
				if (!oFormatOptions || ((!oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure) && (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber))) {
					return BaseType.Unit;
				} else if (!oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber) {
					return BaseType.Numeric; // only number to show
				} else {
					return BaseType.String; // only unit to show
				}
			default:
				return ODataTypeUtil.getBaseType(sType, oFormatOptions, oConstraints);
		}
	};

	ODataV4TypeUtil.getDataTypeClassName = function(sType) {

		// V4 specific types
		var mEdmTypes = {
			"Edm.Date": "sap.ui.model.odata.type.Date", // V4 Date
			"Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay" // V4 constraints: {precision}
		};
		if (mEdmTypes[sType]) {
			sType = mEdmTypes[sType];
		} else {
			sType = ODataTypeUtil.getDataTypeClassName(sType);
		}
		return sType;
	};

	ODataV4TypeUtil.getDataTypeInstance = function(sDataType, formatOptions, constraints) {
		switch (sDataType) {
			case "sap.ui.model.odata.type.DateTimeOffset":
			case "Edm.DateTimeOffset":
				if (!constraints) {
					constraints = {};
				}
				constraints.V4 = true;
				break;

			default:
		}

		var TypeClass = this.getDataTypeClass(sDataType);
		return new TypeClass(formatOptions, constraints);
	};

	return ODataV4TypeUtil;

});
