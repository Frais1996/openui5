/*!
 * ${copyright}
 */

sap.ui.define(['./library', "sap/base/security/encodeCSS"],
	function(library, encodeCSS) {
	"use strict";

	// shortcut for sap.m.GenericTileScope
	var GenericTileScope = library.GenericTileScope;

	/**
	 * SlideTile renderer.
	 * @namespace
	 */
	var SlideTileRenderer = {
		apiVersion : 2  // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	SlideTileRenderer.render = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString(),
			sScope = oControl.getScope(),
			sScopeClass = encodeCSS("sapMSTScope" + sScope),
			iLength;

		oRm.openStart("div", oControl);
		if (oControl.getHeight()) {
			oRm.style("height",oControl.getHeight());
		}
		if (oControl.getWidth()) {
			oRm.style("width",oControl.getWidth());
		}
		oRm.class("sapMST");
		oRm.class(sScopeClass);
		if (!this._bAnimationPause) {
			oRm.class("sapMSTPauseIcon");
		}
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}
		iLength = oControl.getTiles().length;
		if (iLength > 1) {
			oRm.attr("tabindex", "0");
		}
		oRm.attr("role", "presentation");
		oRm.openEnd();
		if (iLength > 1 && sScope === GenericTileScope.Display) {
			this._renderPausePlayIcon(oRm, oControl);
			this._renderTilesIndicator(oRm, oControl);
		}
		this._renderTiles(oRm, oControl, iLength);
		if (sScope === GenericTileScope.Actions) {
			this._renderActionsScope(oRm, oControl);
		}
		oRm.openStart("div",oControl.getId() + "-focus");
		oRm.class("sapMSTFocusDiv");
		oRm.openEnd();
		oRm.close("div");
		oRm.close("div");
	};

	SlideTileRenderer._renderTiles = function(oRm, oControl, iLength) {
		oRm.openStart("div");
		oRm.class("sapMSTOverflowHidden");
		oRm.openEnd();
		for (var i = 0; i < iLength; i++) {
			oRm.openStart("div", oControl.getId() + "-wrapper-" + i );
			oRm.class("sapMSTWrapper");
			if (oControl.getTiles()[i].getFrameType() == sap.m.FrameType.Stretch && oControl.getTiles()[i].getMode() == sap.m.GenericTileMode.ArticleMode) {
				oRm.class("sapMGTTileStretch");
			}
			oRm.openEnd();
			oRm.renderControl(oControl.getTiles()[i]);
			oRm.close("div");
		}
		oRm.close("div");
	};

	SlideTileRenderer._renderTilesIndicator = function(oRm, oControl) {
		var iPageCount = oControl.getTiles().length;

		oRm.openStart("div",  oControl.getId() + "-tilesIndicator");
		oRm.class("sapMSTBulleted");
		oRm.openEnd();
		for ( var i = 0; i < iPageCount; i++) {
			oRm.openStart("span", oControl.getId() + "-tileIndicator-" + i );
			oRm.openEnd();
			oRm.close("span");
		}
		oRm.close("div");
	};

	SlideTileRenderer._renderPausePlayIcon = function(oRm, oControl) {
		if (oControl.getTiles().length > 1) {
			oRm.openStart("div");
			oRm.class("sapMSTIconClickTapArea");
			oRm.openEnd();
			oRm.close("div");
			oRm.openStart("div");
			oRm.class("sapMSTIconDisplayArea");
			oRm.openEnd();
			oRm.close("div");
			oRm.openStart("div");
			oRm.class("sapMSTIconNestedArea");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_pausePlayIcon"));
			oRm.close("div");
		}
	};

	SlideTileRenderer._renderActionsScope = function(oRm, oControl) {
		oRm.renderControl(oControl._oRemoveButton);
		oRm.renderControl(oControl._oMoreIcon);
	};

	return SlideTileRenderer;

}, /* bExport= */ true);