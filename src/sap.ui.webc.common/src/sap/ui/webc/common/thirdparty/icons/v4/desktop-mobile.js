sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "desktop-mobile";
	const pathData = "M32 320h288v32H32q-13 0-22.5-9.5T0 320V64q0-14 9.5-23T32 32h352q14 0 23 9t9 23v128h-32V64H32v256zm240 64q16 0 16 16 0 6-4.5 11t-11.5 5H144q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5h128zm208-160q13 0 22.5 9t9.5 23v192q0 14-9.5 23t-22.5 9h-96q-14 0-23-9t-9-23V256q0-14 9-23t23-9h96zm0 32h-96v192h96V256z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV5 = { pathData };

	return pathDataV5;

});
