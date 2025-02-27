sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "header";
	const pathData = "M480 448q0 14-9 23t-23 9H64q-13 0-22.5-9T32 448V64q0-13 9.5-22.5T64 32h384q14 0 23 9.5t9 22.5v384zm-32-288H64v288h384V160z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV5 = { pathData };

	return pathDataV5;

});
