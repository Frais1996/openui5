sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/table/Util",
	"sap/ui/core/theming/Parameters",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/Single",
	"sap/ui/model/odata/type/Guid",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/model/odata/type/SByte",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/Time",
	"sap/ui/model/odata/type/TimeOfDay"
], function(Core, Util, ThemeParameters, BooleanType, Byte, DateType, DateTime, Decimal, Double, Single, Guid, Int16, Int32, Int64, SByte, StringType, Time, TimeOfDay) {
	"use strict";
	/* global QUnit,sinon */

	QUnit.test("measureText", function(assert) {
		assert.ok(Util.measureText("aaa") > Util.measureText("aa"));
		assert.ok(Util.measureText("w".repeat(50)) > 30);
		assert.ok(Util.measureText("i") < 0.5);

		assert.ok(Util.measureText("0") < Util.measureText("0", "bold 16px Arial"));
		assert.ok(Util.measureText("w", "12px Arial") > Util.measureText("w", "10px Arial"));

		var fSizeBeforeThemeChanged = Util.measureText("Text");

		var oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("1rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Helvetica");
		Core.notifyContentDensityChanged();

		var fSizeAfterThemeChanged = Util.measureText("Text");
		assert.ok(fSizeAfterThemeChanged > fSizeBeforeThemeChanged);

		oThemeParametersStub.restore();
		Core.notifyContentDensityChanged();
	});

	QUnit.test("calcTypeWidth - Boolean", function(assert) {
		var fYesBeforeThemeChanged = Util.measureText("Yes");
		assert.equal(Util.calcTypeWidth(new BooleanType()), fYesBeforeThemeChanged);

		var oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("1rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Arial");
		Core.notifyContentDensityChanged();

		assert.ok(Util.calcTypeWidth(new BooleanType()) > fYesBeforeThemeChanged);

		oThemeParametersStub.restore();
		Core.notifyContentDensityChanged();
	});

	QUnit.test("calcTypeWidth - String", function(assert) {

		function Str(iMaxLength) {
			return new StringType(null, {maxLength: iMaxLength});
		}
		function Size(iLength) {
			return Util.measureText("A".repeat(iLength));
		}

		assert.equal(Util.calcTypeWidth(Str()), 19 * 0.75);
		assert.equal(Util.calcTypeWidth(Str(), {maxWidth: 40}), 30);
		assert.equal(Util.calcTypeWidth(Str(), {maxWidth: 5}), 5);
		assert.equal(Util.calcTypeWidth(Str(), {maxWidth: 12}), 10);

		assert.equal(Util.calcTypeWidth(Str(25), {maxWidth: 5}), 5);

		assert.equal(Util.calcTypeWidth(Str(18)), Size(18));
		assert.equal(Util.calcTypeWidth(Str(1)), Size(1));

		assert.equal(Util.calcTypeWidth(Str(15), {maxWidth: 4}), 4);

		assert.ok(Util.calcTypeWidth(Str(40), {maxWidth: 25}) > Util.calcTypeWidth(Str(40), {maxWidth: 20}));
		assert.ok(Util.calcTypeWidth(Str(40)) > Util.calcTypeWidth(Str(40), {maxWidth: 15}));
		assert.ok(Util.calcTypeWidth(Str(70)) > 18);
		assert.ok(Util.calcTypeWidth(Str(60)) > 17);
		assert.ok(Util.calcTypeWidth(Str(50)) > 16);
		assert.ok(Util.calcTypeWidth(Str(40)) > 14);
		assert.ok(Util.calcTypeWidth(Str(30)) > 12);
		assert.ok(Util.calcTypeWidth(Str(20)) > 10);
	});

	QUnit.test("calcTypeWidth - Date&Time", function(assert) {
		assert.ok(Util.calcTypeWidth(new DateType({style: "medium"})) > Util.calcTypeWidth(new DateType({style: "short"})));
		assert.equal(Util.calcTypeWidth(new DateType({pattern : "dd.MM.yyyy"})), Util.measureText("26.10.2023"));

		assert.ok(Util.calcTypeWidth(new Time({style: "long"})) > Util.calcTypeWidth(new Time({style: "short"})));
		assert.equal(Util.calcTypeWidth(new Time({UTC: true})), Util.calcTypeWidth(new Time()));

		assert.ok(Util.calcTypeWidth(new DateTime()) > Util.calcTypeWidth(new Time()) + Util.calcTypeWidth(new DateType(null, { displayFormat : "Date" })));

		assert.equal(Util.calcTypeWidth(new TimeOfDay()), Util.measureText("10:47:58 PM"));
	});

	QUnit.test("calcTypeWidth - Numeric", function(assert) {
		assert.equal(Util.calcTypeWidth(new Byte()), Util.calcTypeWidth(new SByte()));
		assert.ok(Util.calcTypeWidth(new Int16()) < Util.calcTypeWidth(new Int32()));
		assert.ok(Util.calcTypeWidth(new Int32()) < Util.calcTypeWidth(new Int64()));
		assert.ok(Util.calcTypeWidth(new Double()) < Util.calcTypeWidth(new Decimal()));
		assert.ok(Util.calcTypeWidth(new Int16()) < Util.calcTypeWidth(new Single()));
		assert.ok(Util.calcTypeWidth(new Int32()) > Util.calcTypeWidth(new Single()));

		assert.equal(Util.calcTypeWidth(new Decimal(null, {precision: 10, scale: 3})), Util.measureText("2.000.000,000"));
		assert.equal(Util.calcTypeWidth(new Decimal(null, {precision: 5})), Util.measureText("20,000"));
	});

	QUnit.test("calcTypeWidth - Other", function(assert) {
		var done = assert.async();

		sap.ui.require(["sap/ui/comp/odata/type/FiscalDate"], function(FiscalDate) {
			assert.equal(Util.calcTypeWidth(new FiscalDate(null, {maxLength: 10}, {
				anotationType: "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"
			})), Util.measureText("A".repeat(10)));
			assert.equal(Util.calcTypeWidth(new Guid()), 8);
			done();
		}, function(oError) {
			assert.ok(oError.message, "Test Skipped");
			done();
		});
	});

	QUnit.test("calcHeaderWidth", function(assert) {
		assert.equal(Util.calcHeaderWidth("Header", 11, 10), 10, "fContentWidth > iMaxWidth");
		assert.equal(Util.calcHeaderWidth("Hea", 2, 0, 4), 4, "iMinWidth > iHeaderLength");
		assert.equal(Util.calcHeaderWidth("He", 3, 0, 5), 5, "fContentWidth > iHeaderLength");

		assert.equal(Util.calcHeaderWidth("A".repeat(100), 10, 8), 8);
		assert.ok(Util.calcHeaderWidth("A".repeat(100), 10) > Util.calcHeaderWidth("A".repeat(100), 5));
		assert.ok(Util.calcHeaderWidth("A".repeat(25), 15) > Util.calcHeaderWidth("A".repeat(20), 15));

		var fSizeBeforeThemeChanged = Util.calcHeaderWidth("Some Long Header Text", 9);

		var oThemeParametersStub = sinon.stub(ThemeParameters, "get");
		oThemeParametersStub.withArgs({ name: "sapMFontMediumSize" }).returns("0.875rem");
		oThemeParametersStub.withArgs({ name: "sapUiFontFamily" }).returns("Arial");
		oThemeParametersStub.withArgs({ name: "sapUiColumnHeaderFontWeight" }).returns("bold");
		Core.notifyContentDensityChanged();

		var fSizeAfterThemeChanged = Util.calcHeaderWidth("Some Long Header Text", 9);
		assert.ok(fSizeAfterThemeChanged > fSizeBeforeThemeChanged);
		assert.equal(fSizeAfterThemeChanged, Util.measureText("Some Long Header Text", "bold 14px Arial"));

		oThemeParametersStub.restore();
		Core.notifyContentDensityChanged();
	});

});