sap.ui.define([
	"sap/ui/test/generic/_EnforceSemanticRendering"
], function(_EnforceSemanticRendering) {
	"use strict";

	return _EnforceSemanticRendering.run({
		library: "sap.ui.core",
		excludes: [
			"sap.ui.core.mvc.HTMLView",
			"sap.ui.core.tmpl.TemplateControl"
		]
	});
});
