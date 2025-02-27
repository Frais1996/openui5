/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer'], function(Renderer, InputBaseRenderer) {
	"use strict";

	/**
	 * MaskInputRenderer renderer.
	 * @namespace
	 */
	var MaskInputRenderer = Renderer.extend(InputBaseRenderer);

	MaskInputRenderer.apiVersion = 2;

	/**
	 * Returns the accessibility state of the control.
	 *
	 * @override
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {Object}
	 */
	MaskInputRenderer.getAccessibilityState = function (oControl) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sCustomRole = oResourceBundle.getText("MASKINPUT_ROLE_DESCRIPTION"),
			mAccessibilityState = InputBaseRenderer.getAccessibilityState.apply(this, arguments);

		mAccessibilityState["roledescription"] = sCustomRole;

		return mAccessibilityState;
	};

	return MaskInputRenderer;

}, /* bExport= */ true);
