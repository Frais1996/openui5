sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringParameter": {
						"manifestpath": "/temp/configuration/parameters/stringParameter/value",
						"type": "string"
					}
				}
			},
			"preview": {
				"modes": "AbstractLive",
				"src": "./img/preview.png",
				"scaled": false
			}
		});
	};
});
