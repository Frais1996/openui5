/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, Context, Filter, FilterOperator, FilterProcessor, CountMode,
		ODataUtils, OperationMode, ODataListBinding, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataListBinding (ODataListBindingNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
[
	{transitionMessagesOnly : true, headers : {"sap-messages" : "transientOnly"}},
	{transitionMessagesOnly : false, headers : undefined}
].forEach(function (oFixture, i) {
	QUnit.test("loadData calls read w/ parameters refresh, headers, " + i, function (assert) {
		var oBinding, oRemoveExpectation, oResetDataExpectation,
			oContext = {},
			oModel = {
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				read : function () {},
				resolveDeep : function () {}
			},
			bRefresh = "{boolean} bRefresh";

		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined).returns("~custom");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("path", sinon.match.same(oContext))
			.returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs();

		oRemoveExpectation = this.mock(ODataListBinding.prototype)
			.expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oResetDataExpectation = this.mock(ODataListBinding.prototype).expects("resetData")
			.withExactArgs();

		oBinding = new ODataListBinding(oModel, "path", oContext);

		assert.ok(oResetDataExpectation.calledImmediatelyAfter(oRemoveExpectation));

		this.mock(oBinding).expects("_addFilterQueryOption").withExactArgs([], true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~path");
		oBinding.bSkipDataEvents = true;
		oBinding.bRefresh = bRefresh;
		oBinding.bTransitionMessagesOnly = oFixture.transitionMessagesOnly;

		this.mock(oModel).expects("read").withExactArgs("path", {
				headers : oFixture.headers,
				canonicalRequest : undefined,
				context : sinon.match.same(oContext),
				error : sinon.match.func,
				groupId : undefined,
				success : sinon.match.func,
				updateAggregatedMessages : bRefresh,
				urlParameters : ["~custom"]
			});

		// code under test
		oBinding.loadData();
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bUseClientMode) {
	var sTitle = "loadData: calls _addFilterQueryOption; client mode=" + bUseClientMode;

	QUnit.test(sTitle, function (assert) {
		var oModel = {read : function () {}},
			oBinding = {
				oModel : oModel,
				sPath : "/~Path",
				mRequestHandles : {},
				bSkipDataEvents : true,
				_addFilterQueryOption : function () {},
				isRelative : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(bUseClientMode);
		this.mock(oBinding).expects("_addFilterQueryOption")
			.withExactArgs([], !bUseClientMode)
			.callsFake(function (aParams) {
				aParams.push("~filter"); // simulate _addFilterQueryOption implementation
			});
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);
		this.mock(oModel).expects("read").withExactArgs("/~Path", {
				canonicalRequest : undefined,
				context : undefined,
				error : sinon.match.func,
				groupId : undefined,
				headers : undefined,
				success : sinon.match.func,
				updateAggregatedMessages : undefined,
				urlParameters : ["~filter"]
			});

		// code under test
		ODataListBinding.prototype.loadData.call(oBinding);
	});
});

	//*********************************************************************************************
[
	{operationMode : OperationMode.Auto, useFilterParams : false},
	{operationMode : OperationMode.Client, useFilterParams : true},
	{operationMode : OperationMode.Default, useFilterParams : true},
	{operationMode : OperationMode.Server, useFilterParams : true}
].forEach(function (oFixture) {
	var sTitle = "_getLength: calls _addFilterQueryOption; operation mode="
			+ oFixture.operationMode;

	QUnit.test(sTitle, function (assert) {
		var oModel = {read : function () {}},
			oBinding = {
				sCountMode : CountMode.Request,
				oModel : oModel,
				sOperationMode : oFixture.operationMode,
				sPath : "/~Path",
				_addFilterQueryOption : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("_addFilterQueryOption")
			.withExactArgs([], oFixture.useFilterParams)
			.callsFake(function (aParams) {
				aParams.push("~filter"); // simulate _addFilterQueryOption implementation
			});
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/~Path");

		this.mock(oModel).expects("read").withExactArgs("/~Path/$count", {
				canonicalRequest : undefined,
				context : undefined,
				error : sinon.match.func,
				groupId : undefined,
				success : sinon.match.func,
				urlParameters : ["~filter"],
				withCredentials : undefined
			});

		// code under test
		ODataListBinding.prototype._getLength.call(oBinding);
	});
});

	//*********************************************************************************************
[
	{parameters : undefined, expected : false},
	{parameters : {}, expected : false},
	{parameters : {foo : "bar"}, expected : false},
	{parameters : {transitionMessagesOnly : false}, expected : false},
	{parameters : {transitionMessagesOnly : 0}, expected : false},
	{parameters : {transitionMessagesOnly : true}, expected : true},
	{parameters : {transitionMessagesOnly : {}}, expected : true}
].forEach(function (oFixture, i) {
	var sTitle = "constructor: createdEntitiesKey and parameter transitionMessagesOnly, " + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding,
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(oFixture.parameters))
			.returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(true);

		// code under test
		oBinding = new ODataListBinding(oModel, "path", "context", undefined /*aSorters*/,
			undefined /*aFilters*/, oFixture.parameters);

		assert.strictEqual(oBinding.bTransitionMessagesOnly, oFixture.expected);
	});
});

	//*********************************************************************************************
	QUnit.test("constructor: remove persisted created contexts without expanded list",
			function (assert) {
		var oModel = {
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined).returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList")
			.withExactArgs()
			.returns(false);
		this.mock(ODataListBinding.prototype).expects("_removePersistedCreatedContexts")
			.withExactArgs();
		this.mock(ODataListBinding.prototype).expects("resetData").withExactArgs();

		// code under test
		assert.ok(new ODataListBinding(oModel, "path", "context"));
	});

	//*********************************************************************************************
[
	{parameters : undefined, expected : ""},
	{parameters : {}, expected : ""},
	{parameters : {createdEntitiesKey : ""}, expected : ""},
	{parameters : {createdEntitiesKey : "bar"}, expected : "bar"}
].forEach(function (oFixture, i) {
	QUnit.test("constructor: createdEntitiesKey parameter, #" + i, function (assert) {
		var oBinding,
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(oFixture.parameters))
			.returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(true);

		// code under test
		oBinding = new ODataListBinding(oModel, "path", "context", undefined /*aSorters*/,
			undefined /*aFilters*/, oFixture.parameters);

		assert.strictEqual(oBinding.sCreatedEntitiesKey, oFixture.expected);
	});
});

	//*********************************************************************************************
["resolvedPath", undefined, null].forEach(function (sResolvedPath) {
	QUnit.test("_checkDataStateMessages: with deepPath: " + sResolvedPath, function (assert) {
		var oModel = {
				getMessagesByPath : function () {}
			},
			oBinding = {
				sDeepPath : "deepPath",
				oModel : oModel
			},
			oDataState = {
				setModelMessages : function () {}
			},
			aMessagesByPath = "aMessages";

		this.mock(oModel).expects("getMessagesByPath").withExactArgs("deepPath", true)
			.exactly(sResolvedPath === "resolvedPath" ? 1 : 0)
			.returns(aMessagesByPath);
		this.mock(oDataState).expects("setModelMessages").withExactArgs(aMessagesByPath)
			.exactly(sResolvedPath === "resolvedPath" ? 1 : 0);

		// code under test
		ODataListBinding.prototype._checkDataStateMessages.call(oBinding, oDataState, sResolvedPath);
	});
});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: keys for predicate known", function (assert) {
		var oBinding = {},
			oDataUtilsMock = this.mock(ODataUtils),
			oExpectedFilter = new Filter({
				and : true,
				filters : [
					new Filter("SalesOrderID", FilterOperator.EQ, "~42~"),
					new Filter("ItemPosition", FilterOperator.EQ, "~10~")
				]
			}),
			sPredicate = "(SalesOrderID='42',ItemPosition='10')";

		oDataUtilsMock.expects("parseValue").withExactArgs("'10'").returns("~10~");
		oDataUtilsMock.expects("parseValue").withExactArgs("'42'").returns("~42~");

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getFilterForPredicate.call(oBinding, sPredicate),
			oExpectedFilter);
	});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: key for predicate unknown", function (assert) {
		var oModel = {
				oMetadata : {
					getKeyPropertyNamesByPath : function () {}
				}
			},
			oBinding = {
				sDeepPath : "~deepPath~",
				oModel : oModel
			};

		this.mock(oModel.oMetadata).expects("getKeyPropertyNamesByPath")
			.withExactArgs("~deepPath~")
			.returns(["SalesOrderID"]);
		this.mock(ODataUtils).expects("parseValue").withExactArgs("'42'").returns("~42~");

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getFilterForPredicate.call(oBinding, "('42')"),
			new Filter("SalesOrderID", FilterOperator.EQ, "~42~"));
	});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: encoded key predicates; integrative", function (assert) {
		var oExpectedFilter = new Filter({
				bAnd : true,
				aFilters : [
					new Filter("string", FilterOperator.EQ, "abc123' !\"§$%&/()=:;/?+"),
					new Filter("datetime", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 18, 9, 50, 58))),
					new Filter("datetimems", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 19, 9, 50, 58, 123))),
					new Filter("datetimeoffset", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 20, 9, 50, 58))),
					new Filter("time", FilterOperator.EQ,
						{"__edmType" : "Edm.Time", "ms" : 34936000}),
					new Filter("guid", FilterOperator.EQ, "42010aef-0de5-1edb-aead-63ba217fb0e7"),
					new Filter("null", FilterOperator.EQ, null),
					new Filter("decimal", FilterOperator.EQ, "-1.23"),
					new Filter("double", FilterOperator.EQ, "-2.34"),
					new Filter("float", FilterOperator.EQ, "-3.45"),
					new Filter("int64", FilterOperator.EQ, "-123"),
					new Filter("sbyte", FilterOperator.EQ, -78),
					new Filter("byte", FilterOperator.EQ, 255),
					new Filter("true", FilterOperator.EQ, true),
					new Filter("false", FilterOperator.EQ, false),
					new Filter("binary", FilterOperator.EQ, "0123456789abcdef")
				]
			}),
			sPredicate = "("
				+ "string='abc123''%20%21%22%c2%a7%24%25%26%2f%28%29%3d%3a%3b%2f%3f%2b',"
				+ "datetime=datetime'2021-06-18T09%3a50%3a58',"
				+ "datetimems=datetime'2021-06-19T09%3a50%3a58.123',"
				+ "datetimeoffset=datetimeoffset'2021-06-20T09%3a50%3a58Z',"
				// for following data types encoded characters cannot be in the key predicate
				+ "time=time'PT09H42M16S',"
				+ "guid=guid'42010aef-0de5-1edb-aead-63ba217fb0e7'," // only [A-Fa-f0-9] allowed
				+ "null=null,"
				+ "decimal=-1.23m,"
				+ "double=-2.34d,"
				+ "float=-3.45f,"
				+ "int64=-123l,"
				+ "sbyte=-78,"
				+ "byte=255,"
				+ "true=true,"
				+ "false=false,"
				+ "binary=binary'0123456789abcdef'" // [A-Fa-f0-9][A-Fa-f0-9]*
				+ ")";

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getFilterForPredicate.call({}, sPredicate),
			oExpectedFilter);
	});

	//*********************************************************************************************
	QUnit.test("requestFilterForMessages: unresolved", function (assert) {
		var oModel = {getMessagesByPath : function () {}},
			oBinding = {
				oModel : oModel,
				getResolvedPath : function () {}
			},
			oPromise;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.mock(oModel).expects("getMessagesByPath").never();

		// code under test
		oPromise = ODataListBinding.prototype.requestFilterForMessages.call(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oFilter) {
			assert.strictEqual(oFilter, null);
		});
	});

	//*********************************************************************************************
[true, false].forEach(function (bWithFilter) {
	[{
		aFilterForPredicate : [],
		aMessages : [] // contains sap.ui.core.message.Message objects
	}, {
		aFilterForPredicate : bWithFilter ? [] : ["(~keyPredicate~)"],
		aMessages : [{aFullTargets : ["~deepPath~(~keyPredicate~)"], message : "out"}]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{aFullTargets : ["~deepPath~(~keyPredicate~)"], message : "in"}]
	}, {
		aFilterForPredicate : bWithFilter
			? ["(~keyPredicate0~)", "(~keyPredicate2~)"]
			: ["(~keyPredicate0~)", "(~keyPredicate1~)", "(~keyPredicate2~)", "(~keyPredicate3~)"],
		aMessages : [
			{aFullTargets : ["~deepPath~"], message : "out"},
			{aFullTargets : ["~deepPath~(~keyPredicate0~)/foo"], message : "in"},
			{aFullTargets : ["~deepPath~(~keyPredicate1~)"], message : "out"},
			{aFullTargets : ["~deepPath~(~keyPredicate2~)"], message : "in"},
			{aFullTargets : ["~deepPath~(~keyPredicate3~)"], message : "out"}
		]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{
			aFullTargets : ["~deepPath~(~keyPredicate~)/A", "~deepPath~(~keyPredicate~)/B"],
			message : "in"
		}]
	}, {
		aFilterForPredicate : ["(~keyPredicate1~)", "(~keyPredicate2~)"],
		aMessages : [{
			aFullTargets : ["~deepPath~(~keyPredicate1~)/A", "~deepPath~(~keyPredicate2~)/B"],
			message : "in"
		}]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{
			aFullTargets : ["~parentEntity~", "~deepPath~(~keyPredicate~)/B"],
			message : "in"
		}]
	}].forEach(function (oFixture, i) {
	var sTitle = "requestFilterForMessages: with filter: " + bWithFilter + ", " + i;

	QUnit.test(sTitle, function (assert) {
		var oCallback = {
				fnFilter : function () {}
			},
			oCallbackMock = this.mock(oCallback),
			aFilterForPredicate = oFixture.aFilterForPredicate,
			aFilters = [],
			aMessages = oFixture.aMessages,
			oModel = {getMessagesByPath : function () {}},
			oBinding = {
				sDeepPath : "~deepPath~",
				oModel : oModel,
				_getFilterForPredicate : function () {},
				getResolvedPath : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oPromise;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("resolvedPath");
		this.mock(oModel).expects("getMessagesByPath").withExactArgs("~deepPath~", true)
			.returns(aMessages);
		if (aMessages.length && bWithFilter) {
			aMessages.forEach(function (oMessage) {
				oCallbackMock.expects("fnFilter").withExactArgs(sinon.match.same(oMessage))
					.returns(oMessage.message === "in");
			});
		} else {
			oCallbackMock.expects("fnFilter").never();
		}
		if (aFilterForPredicate.length) {
			aFilterForPredicate.forEach(function (sPredicate) {
				var oFilter = new Filter("~property~", FilterOperator.EQ, "~value~");

				oBindingMock.expects("_getFilterForPredicate").withExactArgs(sPredicate)
					.returns(oFilter);
				aFilters.push(oFilter);
			});
		} else {
			oBindingMock.expects("_getFilterForPredicate").never();
		}

		// code under test
		oPromise = ODataListBinding.prototype.requestFilterForMessages
			.call(oBinding, bWithFilter ? oCallback.fnFilter : undefined);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oFilter) {
			if (aFilters.length === 0) {
				assert.strictEqual(oFilter, null);
			} else if (aFilters.length === 1) {
				assert.deepEqual(oFilter, aFilters[0]);
			} else {
				assert.strictEqual(oFilter.bAnd, undefined);
				assert.deepEqual(oFilter.aFilters, aFilters);
			}
		});
	});
	});
});

	//*********************************************************************************************
[{
	bInitial : true,
	bTransient : false
}, {
	bInitial : true,
	bIsLoaded : false,
	bTransient : false
}, {
	bInitial : false,
	bIsLoaded : true,
	bTransient : false
}, {
	bInitial : true,
	bIsLoaded : true,
	bTransient : true
}].forEach(function (oFixture, i) {
	QUnit.test("initialize: not yet ready for initialization, #" + i, function (assert) {
		var oBinding = {
				bInitial : oFixture.bInitial,
				oModel : {},
				_hasTransientParentContext : function () {}
			},
			bCallsHasTransientParentContext = oFixture.bInitial && oFixture.bIsLoaded;

		if ("bIsLoaded" in oFixture) {
			oBinding.oModel.oMetadata = {isLoaded : function () {}};
			this.mock(oBinding.oModel.oMetadata).expects("isLoaded")
				.withExactArgs()
				.returns(oFixture.bIsLoaded);
		}
		this.mock(oBinding).expects("_hasTransientParentContext")
			.withExactArgs()
			.exactly(bCallsHasTransientParentContext ? 1 : 0)
			.returns(oFixture.bTransient);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.initialize.call(oBinding), oBinding);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bBoundToList) {
	[true, false].forEach(function (bSuspended) {
		[true, false].forEach(function (bDataAvailable) {
	var sTitle = "initialize: initialize, bound to a list: " + bBoundToList
			+ ", suspended: " + bSuspended + ", data available: " + bDataAvailable;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				bDataAvailable : bDataAvailable,
				bInitial : true,
				oModel : {
					oMetadata : {
						isLoaded : function () {}
					}
				},
				bSuspended : bSuspended,
				_checkPathType : function () {},
				_fireChange : function () {},
				_fireRefresh : function () {},
				_hasTransientParentContext : function () {},
				_initSortersFilters : function () {},
				checkDataState : function () {},
				getResolvedPath : function () {},
				resetData : function () {}
			},
			sResolvedPath = "~resolvedPath";

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding.oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(bBoundToList);
		this.mock(oBinding).expects("getResolvedPath")
			.withExactArgs()
			.exactly(bBoundToList ? 0 : 1)
			.returns(sResolvedPath);
		this.oLogMock.expects("error")
			.withExactArgs("List Binding is not bound against a list for ~resolvedPath")
			.exactly(bBoundToList ? 0 : 1);
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change})
			.exactly(!bSuspended && bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("resetData")
			.withExactArgs()
			.exactly(!bSuspended && !bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("_fireRefresh")
			.withExactArgs({reason : ChangeReason.Refresh})
			.exactly(!bSuspended && !bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("checkDataState").withExactArgs();

		// code under test
		assert.strictEqual(ODataListBinding.prototype.initialize.call(oBinding), oBinding);

		assert.strictEqual(oBinding.bInitial, false);
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: calls checkDataState if context changes; no created contexts",
			function (assert) {
		var oRefreshExpectation, oRemoveExpectation,
			oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : "~oContext",
				bInitial : false,
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_hasTransientParentContext : function () {},
				_initSortersFilters : function () {},
				_refresh : function () {},
				_removePersistedCreatedContexts : function () {},
				checkDataState : function () {},
				checkExpandedList : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oNewContext = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			};

		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("~oContext", sinon.match.same(oNewContext))
			.returns(true);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oNewContext))
			.returns("~resolvedDeepPath");
		oBindingMock.expects("_checkPathType").withExactArgs().returns(true);
		oBindingMock.expects("checkDataState").withExactArgs();
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		oBindingMock.expects("_initSortersFilters").withExactArgs();
		oBindingMock.expects("checkExpandedList").withExactArgs().returns(false);
		oRemoveExpectation = oBindingMock.expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oRefreshExpectation = oBindingMock.expects("_refresh").withExactArgs();

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, oNewContext);
		assert.ok(oRefreshExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});

	//*********************************************************************************************
	QUnit.test("setContext: new context is transient", function (assert) {
		var oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_fireChange : function () {},
				_hasTransientParentContext : function () {},
				checkDataState : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oNewV2Context = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			};

		this.mock(oNewV2Context).expects("isRefreshForced").withExactArgs().returns(false);
		this.mock(oNewV2Context).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oNewV2Context).expects("isUpdated").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("~oContext", sinon.match.same(oNewV2Context))
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oNewV2Context))
			.returns("~resolvedDeepPath");
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkDataState").withExactArgs();
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(true);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oNewV2Context);

		assert.strictEqual(oBinding.aAllKeys, null);
		assert.deepEqual(oBinding.aKeys, []);
		assert.strictEqual(oBinding.iLength, 0);
		assert.strictEqual(oBinding.bLengthFinal, true);
	});

	//*********************************************************************************************
	QUnit.test("setContext: set updated context while there are transient entities",
			function (assert) {
		var oRefreshExpectation, oRemoveExpectation,
			oContext = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			},
			oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : oContext,
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_hasTransientParentContext : function () {},
				_initSortersFilters : function () {},
				_refresh : function () {},
				_removePersistedCreatedContexts : function () {},
				checkDataState : function () {},
				checkExpandedList : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oContext).expects("isRefreshForced").withExactArgs().returns(true);
		this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oContext).expects("isUpdated").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oContext))
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("~resolvedDeepPath");
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkDataState").withExactArgs();
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("checkExpandedList").withExactArgs().returns(false);
		oRemoveExpectation = this.mock(oBinding).expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oRefreshExpectation = this.mock(oBinding).expects("_refresh").withExactArgs();

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oContext);

		assert.ok(oRefreshExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});

	//*********************************************************************************************
	QUnit.test("checkExpandedList: getResolvedPath is called", function (assert) {
		var oModel = {_getObject : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_getObject").withExactArgs("~sPath", "~oContext")
			.returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.checkExpandedList.call(oBinding), false);
		assert.strictEqual(oBinding.bUseExpandedList, false);
		assert.strictEqual(oBinding.aExpandRefs, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: getResolvedPath is called", function (assert) {
		var oBinding = {
				_hasTransientParentContext : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding, undefined, undefined, "~mEntityTypes");

		assert.strictEqual(oBinding.bPendingRefresh, false);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: parent context is transient", function (assert) {
		var oBinding = {_hasTransientParentContext : function () {}};

		this.mock(oBinding).expects("_hasTransientParentContext").returns(true);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.bPendingRefresh, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_fireRefresh: with resolved path", function (assert) {
		var oBinding = {
				fireEvent : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireEvent").withExactArgs("refresh", "~mParameters");

		// code under test
		ODataListBinding.prototype._fireRefresh.call(oBinding, "~mParameters");

		assert.strictEqual(oBinding.bRefresh, true);
	});

	//*********************************************************************************************
	QUnit.test("_fireRefresh: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._fireRefresh.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_checkPathType: getResolvedPath is called", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._checkPathType.call(oBinding), true);
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype.getDownloadUrl.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: with resolved path", function (assert) {
		var oBinding = {
				oModel : {_createRequestUrl : function () {}},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("_createRequestUrl")
			.withExactArgs("~resolvedPath", null, [])
			.returns("~requestUrl");

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getDownloadUrl.call(oBinding), "~requestUrl");
	});

	//*********************************************************************************************
	QUnit.test("_initSortersFilters: getResolvedPath is called", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._initSortersFilters.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_getEntityType: with resolved path", function (assert) {
		var oBinding = {
				oModel : {
					oMetadata : {_getEntityTypeByPath : function () {}}
				},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~resolvedPath")
			.returns("~entityType");

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getEntityType.call(oBinding), "~entityType");
	});

	//*********************************************************************************************
	QUnit.test("_getEntityType: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getEntityType.call(oBinding), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getContexts: return V2 contexts, no created contexts", function (assert) {
		var oModel = {
				getContext : function () {},
				resolveDeep : function () {}
			},
			oBinding = {
				oContext : "~context",
				aKeys : ["~key(0)", "~key(1)"],
				oModel : oModel,
				sPath : "~path",
				_getCreatedContexts : function () {},
				getResolvedPath : function () {},
				isFirstCreateAtEnd : function () {}
			},
			oModelMock = this.mock(oModel);

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getCreatedContexts").withExactArgs().returns([]);
		oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("/~sDeepPath");
		oModelMock.expects("getContext").withExactArgs("/~key(0)", "/~sDeepPath(0)")
			.returns("~V2Context0");
		oModelMock.expects("getContext").withExactArgs("/~key(1)", "/~sDeepPath(1)")
			.returns("~V2Context1");

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getContexts.call(oBinding, 0, 2),
			["~V2Context0", "~V2Context1"]);
	});


	//*********************************************************************************************
[{
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iLength : 3,
	iStart : 0,
	aResult : ["~oCreated1", "~oCreated0", "~fromBackend0"]
}, {
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iLength : 3,
	iStart : 3,
	aResult : ["~fromBackend1"]
}, {
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iLength : 2,
	iStart : 1,
	aResult : ["~oCreated0", "~fromBackend0"]
}, {
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated3", "~oCreated2", "~oCreated1", "~oCreated0"],
	iLength : 2,
	iStart : 1,
	aResult : ["~oCreated2", "~oCreated1"]
}, { // default iLength to iMaximumLength
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iMaximumLength : 4,
	iStart : 0,
	aResult : ["~oCreated1", "~oCreated0", "~fromBackend0", "~fromBackend1"]
}, { // default iStartIndex to 0 and iLength to iMaximumLength
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated3", "~oCreated2", "~oCreated1", "~oCreated0"],
	iMaximumLength : 5,
	aResult : ["~oCreated3", "~oCreated2", "~oCreated1", "~oCreated0", "~fromBackend0"]
}, {
	bAtEnd : true,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated0", "~oCreated1"],
	iLength : 3,
	iStart : 0,
	aResult : ["~fromBackend0", "~fromBackend1", "~oCreated0"]
}, {
	bAtEnd : true,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated0"],
	iLength : 4,
	iStart : 0,
	aResult : ["~fromBackend0", "~fromBackend1", "~oCreated0"]
}, {
	bAtEnd : true,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated0", "~oCreated1"],
	iLength : 4,
	iStart : 2,
	aResult : ["~oCreated0", "~oCreated1"]
}, { // server entries which are not yet read => must not return created entries, avoid gap
	bAtEnd : true,
	iBindingLength : 3,
	aCreatedContexts : ["~oCreated0", "~oCreated1"],
	iLength : 4,
	iStart : 0,
	aResult : ["~fromBackend0", "~fromBackend1"]
}].forEach(function (oFixture, i) {
	QUnit.test("_getContexts: with createdContexts, #" + i, function (assert) {
		var oModel = {
				iSizeLimit : 5,
				getContext : function () {},
				resolveDeep : function () {}
			},
			oBinding = {
				oContext : "~context",
				aKeys : ["~key(0)", "~key(1)"],
				iLength : oFixture.iBindingLength,
				oModel : oModel,
				sPath : "~path",
				_getCreatedContexts : function () {},
				_getMaximumLength : function () {},
				getResolvedPath : function () {},
				isFirstCreateAtEnd : function () {}
			},
			oModelMock = this.mock(oModel);

		this.mock(oBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(oFixture.bAtEnd);
		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(oFixture.aCreatedContexts);
		oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("/~sDeepPath");
		this.mock(oBinding).expects("_getMaximumLength")
			.withExactArgs()
			.exactly(oFixture.iMaximumLength ? 1 : 0)
			.returns(oFixture.iMaximumLength);
		oModelMock.expects("getContext").withExactArgs("/~key(0)", "/~sDeepPath(0)")
			.exactly(oFixture.aResult.includes("~fromBackend0") ? 1 : 0)
			.returns("~fromBackend0");
		oModelMock.expects("getContext").withExactArgs("/~key(1)", "/~sDeepPath(1)")
			.exactly(oFixture.aResult.includes("~fromBackend1") ? 1 : 0)
			.returns("~fromBackend1");

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getContexts.call(oBinding, oFixture.iStart,
				oFixture.iLength),
			oFixture.aResult);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bInitial, i) {
	QUnit.test("getContexts: return empty array; #" + i, function (assert) {
		var oBinding = {
				bInitial : bInitial,
				_hasTransientParentContext : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext")
			.withExactArgs()
			.exactly(bInitial ? 0 : 1)
			.returns(true);

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 2), []);
	});
});

	//*********************************************************************************************
[CountMode.Request, CountMode.Both].forEach(function (sCountMode, i) {
	QUnit.test("getContexts: return empty array; check OperationMode/CountMode; #" + i,
			function (assert) {
		var oBinding = {
				sCountMode : sCountMode,
				bLengthFinal : false,
				bLengthRequested : true,
				sOperationMode : OperationMode.Auto,
				_hasTransientParentContext : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 2), []);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bDataRequested) {
	var sTitle = "getContexts: return V2 contexts returned by _getContexts, fires change event: "
			+ !bDataRequested;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				aAllKeys : [],
				bLengthFinal : true,
				bRefresh : true,
				_fireChange : function () {},
				_getContexts : function () {},
				_hasTransientParentContext : function () {},
				useClientMode : function () {}
			},
			aContexts = ["~V2Context0", "~V2Context1"],
			aResultContexts;

		if (bDataRequested) {
			aContexts.dataRequested = true;
		}
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getContexts").withExactArgs(0, 2).returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change})
			.exactly(bDataRequested ? 0 : 1);

		// code under test
		aResultContexts = ODataListBinding.prototype.getContexts.call(oBinding, 0, 2);

		assert.strictEqual(aResultContexts, aContexts);
		assert.strictEqual(oBinding.iLastLength, 2);
		assert.strictEqual(oBinding.iLastStartIndex, 0);
		assert.strictEqual(oBinding.iLastThreshold, undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: no contexts after refresh and no data requested", function (assert) {
		var oBinding = {
				aAllKeys : null,
				bLengthFinal : false,
				bPendingRequest : true,
				bRefresh : true,
				_fireChange : function () {},
				_getContexts : function () {},
				_hasTransientParentContext : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getContexts").withExactArgs(0, 2).returns([]);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		ODataListBinding.prototype.getContexts.call(oBinding, 0, 2);
	});

	//*********************************************************************************************
[true, false].forEach(function (bLengthFinal) {
	QUnit.test("getContexts: use ODataUtils, bLengthFinal = " + bLengthFinal, function (assert) {
		var oModel = {getServiceMetadata : function () {}},
			oBinding = {
				aKeys : [],
				iLength : 550,
				bLengthFinal : bLengthFinal,
				oModel : oModel,
				bPendingRequest : false,
				_getContexts : function () {},
				_getLength : function () {},
				_getSkipAndTop : function () {},
				_hasTransientParentContext : function () {},
				loadData : function () {},
				useClientMode : function () {}
			},
			aContexts = [],
			oInterval = {start : 0, end : 110},
			aIntervals = [{start : 0, end : 110}];

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getLength").withExactArgs().exactly(bLengthFinal ? 0 : 1);
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, 10)
			.returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getSkipAndTop")
			.withExactArgs(0, 10)
			.returns({skip : "~skip", top : "~top"});
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(oBinding.aKeys , "~skip", "~top", 100,
				bLengthFinal ? oBinding.iLength : undefined)
			.returns(aIntervals);
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs(sinon.match.same(aIntervals))
			.returns(oInterval);
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns(true);
		this.mock(oBinding).expects("loadData")
			.withExactArgs(sinon.match.same(oInterval.start),
				sinon.match.same(oInterval.end - oInterval.start));

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 10, 100),
			aContexts);
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: use _getMaximumLength", function (assert) {
		var oBinding = {
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				bPendingRequest : true,
				bRefresh : true,
				_fireChange : function () {},
				_getContexts : function () {},
				_getMaximumLength : function () {},
				_hasTransientParentContext : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getMaximumLength").withExactArgs().returns("~iLength");
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, "~iLength")
			.returns("~aContexts");
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0,
			/*iLength*/undefined, 100), "~aContexts");
	});

	//*********************************************************************************************
[
	{pendingRequest : false, interval : {start : 0, end : 110}, expectLoad : true},
	{pendingRequest : true, interval : {start : 0, end : 110}, expectLoad : false},
	{pendingRequest : true, interval : undefined, expectLoad : false},
	{pendingRequest : false, interval : undefined, expectLoad : false}
].forEach(function (oFixture) {
	var sTitle = "getContexts: use ODataUtils: pendingRequest = " + oFixture.pendingRequest
			+ ", interval = " + oFixture.interval;
	QUnit.test(sTitle, function (assert) {
		var oModel = {getServiceMetadata : function () {}},
			oBinding = {
				aKeys : [],
				iLength : 550,
				bLengthFinal : true,
				oModel : oModel,
				bPendingRequest : oFixture.pendingRequest,
				_getContexts : function () {},
				_getLength : function () {},
				_getSkipAndTop : function () {},
				_hasTransientParentContext : function () {},
				loadData : function () {},
				useClientMode : function () {}
			},
			aContexts = [],
			aIntervals = [{start : 0, end : 110}];

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, 10)
			.returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getSkipAndTop")
			.withExactArgs(0, 10)
			.returns({skip : "~skip", top : "~top"});
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(oBinding.aKeys , "~skip", "~top", 100, oBinding.iLength)
			.returns(aIntervals);
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs(sinon.match.same(aIntervals))
			.returns(oFixture.interval);
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns(true);
		if (oFixture.interval) {
			this.mock(oBinding).expects("loadData")
				.withExactArgs(oFixture.interval.start,
					oFixture.interval.end - oFixture.interval.start)
				.exactly(oFixture.expectLoad ? 1 : 0);
		}

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 10, 100),
			aContexts);
	});
});

	//*********************************************************************************************
[
	{aCreatedContexts : [], iLength : 0, iExpected : 0},
	{aCreatedContexts : [{}, {}, {}], iLength : 0, iExpected : 3},
	{aCreatedContexts : [], iLength : 42, iExpected : 52},
	{aCreatedContexts : [], iLastLength : 17, iLastThreshold : 13, iLength : 42, iExpected : 55},
	{aCreatedContexts : [], iLastLength : 17, iLength : 42, iExpected : 59},
	{aCreatedContexts : [{}], iLength : 42, iExpected : 53},
	{aCreatedContexts : [{}], iLastThreshold : 13, iLength : 42, iExpected : 56},
	{aCreatedContexts : [{}, {}], iLastLength : 17, iLength : 42, iExpected : 61}
].forEach(function (oFixture, i) {
	QUnit.test("getLength: bLengthFinal=false; #" + i, function (assert) {
		var oBinding = {
				iLastLength : oFixture.iLastLength,
				iLastThreshold : oFixture.iLastThreshold,
				iLength : oFixture.iLength,
				bLengthFinal : false,
				_getCreatedContexts : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(oFixture.aCreatedContexts);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getLength.call(oBinding), oFixture.iExpected);
	});
});

	//*********************************************************************************************
[
	{aCreatedContexts : [], iExpectedValue : 5},
	{aCreatedContexts : [{}, {}], iExpectedValue : 7}
].forEach(function (oFixture, i) {
	QUnit.test("getLength: bLengthFinal=true; #" + i, function (assert) {
		var oBinding = {
				iLength : 5,
				bLengthFinal : true,
				_getCreatedContexts : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(oFixture.aCreatedContexts);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getLength.call(oBinding),
			oFixture.iExpectedValue);
	});
});

	//*********************************************************************************************
[{
	changeSetId : "~changeSetId",
	error : "~error",
	expand : "~expand",
	groupId : "~groupId",
	inactive : "~inactive",
	success : "~success"
}, {
	success : undefined
},
	undefined
].forEach(function (mParameters, i) {
	QUnit.test("create: calls ODataModel#createEntry with parameters, #" + i, function (assert) {
		var fnResolveActivatedPromise,
			oActivatedPromise = new Promise(function (resolve) {
				fnResolveActivatedPromise = resolve;
			}),
			bInactive = mParameters && mParameters.inactive,
			oModel = {
				oMetadata : {isLoaded : function () {}},
				_getCreatedContextsCache : function () {},
				createEntry : function () {}
			},
			oBinding = {
				oContext : "~oContext",
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				bLengthFinal : true,
				oModel : oModel,
				sPath : "~sPath",
				_fireChange : function () {},
				_hasTransientParentContext : function () {},
				fireEvent : function () {},
				getResolvedPath : function () {},
				isFirstCreateAtEnd : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oCreatedContext = {
				created : function () {},
				fetchActivated : function () {}
			},
			oCreatedContextsCache = {addContext : function () {}},
			mCreateParameters;

		oBindingMock.expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_getCreatedContextsCache")
			.withExactArgs()
			.returns(oCreatedContextsCache);
		this.mock(Object).expects("assign")
			.withExactArgs(sinon.match(function (mParam0) {
				assert.deepEqual(mParam0, {
					context : "~oContext",
					properties : "~oInitialData",
					refreshAfterChange : false
				});
				mCreateParameters = mParam0;

				return true;
			}), sinon.match.same(mParameters))
			.callThrough();
		this.mock(oModel).expects("createEntry")
			.withExactArgs("~sPath", sinon.match(function (mParam) {
				return mParam === mCreateParameters;
			}))
			.returns(oCreatedContext);
		this.mock(oCreatedContextsCache).expects("addContext")
			.withExactArgs(sinon.match.same(oCreatedContext), "~resolvedPath",
				"~sCreatedEntitiesKey", true);
		this.mock(oCreatedContext).expects("fetchActivated")
			.withExactArgs()
			.exactly(bInactive ? 1 : 0)
			.returns(oActivatedPromise);
		oBindingMock.expects("fireEvent").withExactArgs("createActivate").never();
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Add});

		// code under test
		assert.strictEqual(ODataListBinding.prototype.create.call(oBinding, "~oInitialData",
			"~bAtEnd", mParameters), oCreatedContext);

		oBindingMock.expects("fireEvent")
			.withExactArgs("createActivate")
			.exactly(bInactive ? 1 : 0);

		// code under test: async context activation
		fnResolveActivatedPromise();

		return oActivatedPromise;
	});
});

	//*********************************************************************************************
[
	{sParameter : "foo", sError : "Parameter 'foo' is not supported"},
	{sParameter : "batchGroupId", sError : "Parameter 'batchGroupId' is not supported"},
	{sParameter : "canonicalRequest", sError : "Parameter 'canonicalRequest' is not supported"},
	{sParameter : "context", sError : "Parameter 'context' is not supported"},
	{sParameter : "created", sError : "Parameter 'created' is not supported"},
	{sParameter : "eTag", sError : "Parameter 'eTag' is not supported"},
	{sParameter : "headers", sError : "Parameter 'headers' is not supported"},
	{sParameter : "properties", sError : "Parameter 'properties' is not supported"},
	{sParameter : "refreshAfterChange", sError : "Parameter 'refreshAfterChange' is not supported"},
	{sParameter : "urlParameters", sError : "Parameter 'urlParameters' is not supported"}
].forEach(function (oFixture) {
	QUnit.test("create: unsupported parameter: " + oFixture.sParameter, function (assert) {
		var oBinding = {isFirstCreateAtEnd : function () {}},
			mParameters = {};

		mParameters[oFixture.sParameter] = "~" + oFixture.sParameter;
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding, /*oInitialData*/undefined,
				/*bAtEnd*/undefined, mParameters);
		}, new Error(oFixture.sError));
	});
});

	//*********************************************************************************************
[{
	bAtEnd : true,
	bCreationAreaAtEnd : true
}, {
	bAtEnd : false,
	bCreationAreaAtEnd : true
}, {
	bAtEnd : true,
	bCreationAreaAtEnd : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("create: bAtEnd with no final length, #" + i, function (assert) {
		var oListBinding = {
				bLengthFinal : false,
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oListBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(oFixture.bCreationAreaAtEnd);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oListBinding, /*oInitialData*/undefined,
				oFixture.bAtEnd);
		}, new Error("Must know the final length to create at the end"));
	});
});

	//*********************************************************************************************
	QUnit.test("create: parent context isTransient error", function (assert) {
		var oBinding = {
				_hasTransientParentContext : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding);
		}, new Error("Parent context is transient"));
	});

	//*********************************************************************************************
	QUnit.test("create: metadata not loaded error", function (assert) {
		var oModel = {oMetadata : {isLoaded : function () {}}},
			oBinding = {
				oModel : oModel,
				_hasTransientParentContext : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(false);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding);
		}, new Error("Metadata is not loaded"));
	});

	//*********************************************************************************************
	QUnit.test("create: expanded list error", function (assert) {
		var oBinding = {
				bUseExpandedList : true,
				_hasTransientParentContext : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding, "~Data");
		}, new Error("The collection has been read via $expand while reading the parent entity"));
	});

	//*********************************************************************************************
[{ // return model's iSizeLimit
	aCreatedContexts : Array(5), iLength : 23, bLengthFinal : false, iResult : 13
}, { // return model's iSizeLimit (smaller than iLength + iCreated)
	aCreatedContexts : Array(2), iLength : 23, bLengthFinal : true, iResult : 13
}, { // return iLength + iCreated (smaller than model's iSizeLimit)
	aCreatedContexts : Array(4), iLength : 8, bLengthFinal : true, iResult : 12
}, { // return iLength + iCreated (smaller than model's iSizeLimit)
	aCreatedContexts : Array(1), iLength : 10, bLengthFinal : true, iResult : 11
}].forEach(function (oFixture, i) {
	QUnit.test("_getMaximumLength #" + i, function (assert) {
		var oBinding = {
				iLength : oFixture.iLength,
				bLengthFinal : oFixture.bLengthFinal,
				oModel : {iSizeLimit : 13},
				_getCreatedContexts : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.exactly(oFixture.bLengthFinal ? 1 : 0)
			.returns(oFixture.aCreatedContexts);

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getMaximumLength.call(oBinding),
			oFixture.iResult);
	});
});

	//*********************************************************************************************
[{
	iCreated : 0, iLength : 10, iStartIndex : 3, oResult : {skip : 3, top : 10}
}, {
	iCreated : 4, iLength : 10, iStartIndex : 4, oResult : {skip : 0, top : 10}
}, {
	iCreated : 4, iLength : 10, iStartIndex : 6, oResult : {skip : 2, top : 10}
}, {
	iCreated : 6, iLength : 10, iStartIndex : 4, oResult : {skip : 0, top : 10}
}, {
	iCreated : 20, iLength : 5, iStartIndex : 4, oResult : {skip : 0, top : 5}
}].forEach(function (oFixture, i) {
	QUnit.test("_getSkipAndTop, creation area at start: #" + i, function (assert) {
		var oBinding = {
				_getCreatedContexts : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(Array(oFixture.iCreated));
		this.mock(oBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(false);

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getSkipAndTop.call(oBinding, oFixture.iStartIndex,
				oFixture.iLength),
			oFixture.oResult);
	});
});

	//*********************************************************************************************
[{ // created contexts, length not final
	iBindingLength : 1,
	iCreated : 1,
	iLength : 10,
	bLengthFinal : false,
	iStartIndex : 5,
	oResult : {skip : 5, top : 10}
}, { // created contexts, length final, start index > binding length (nothing to read)
	iBindingLength : 1,
	iCreated : 1,
	iLength : 10,
	bLengthFinal : true,
	iStartIndex : 5,
	oResult : {skip : 5, top : 0}
}, { // created contexts, length final, start index === binding length (nothing to read)
	iBindingLength : 5,
	iCreated : 1,
	iLength : 10,
	bLengthFinal : true,
	iStartIndex : 5,
	oResult : {skip : 5, top : 0}
}, { // created contexts, length final, requested contexts are all on server (read all)
	iBindingLength : 42,
	iCreated : 1,
	iLength : 10,
	bLengthFinal : true,
	iStartIndex : 5,
	oResult : {skip : 5, top : 10}
}, { // created contexts, length final, requested contexts are partially on server
	iBindingLength : 12,
	iCreated : 1,
	iLength : 10,
	bLengthFinal : true,
	iStartIndex : 5,
	oResult : {skip : 5, top : 7}
}].forEach(function (oFixture, i) {
	QUnit.test("_getSkipAndTop: creation area at end: #" + i, function (assert) {
		var oBinding = {
				_getCreatedContexts : function () {},
				isFirstCreateAtEnd : function () {},
				iLength : oFixture.iBindingLength,
				bLengthFinal : oFixture.bLengthFinal
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(Array(oFixture.iCreated));
		this.mock(oBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(true);

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getSkipAndTop.call(oBinding, oFixture.iStartIndex,
				oFixture.iLength),
			oFixture.oResult);
	});
});

	//*********************************************************************************************
	QUnit.test("_getCreatedContexts:", function (assert) {
		var oModel = {_getCreatedContextsCache : function () {}},
			oBinding = {
				sCreatedEntitiesKey : "~CreatedEntitiesKey",
				oModel : oModel,
				getResolvedPath : function () {}
			},
			oCache = {getContexts : function () {}};

		this.mock(oModel).expects("_getCreatedContextsCache").withExactArgs().returns(oCache);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~Path");
		this.mock(oCache).expects("getContexts")
			.withExactArgs("~Path", "~CreatedEntitiesKey")
			.returns("~aContexts");

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getCreatedContexts.call(oBinding),
			"~aContexts");
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedPersistedExcludeFilter: only transient contexts", function (assert) {
		var oBinding = {_getCreatedContexts : function () {}},
			oContext0 = {isTransient : function () {}},
			oContext1 = {isTransient : function () {}};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns([oContext0, oContext1]);
		this.mock(oContext0).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(true);
		this.mock(ODataUtils).expects("_createFilterParams").never();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getCreatedPersistedExcludeFilter.call(oBinding), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedPersistedExcludeFilter: with persisted contexts", function (assert) {
		var oBinding = {
				oEntityType : "~EntityType",
				oModel : {
					oMetadata : {}
				},
				_getCreatedContexts : function () {},
				_getFilterForPredicate : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oContext0 = {isTransient : function () {}},
			oContext1 = {
				getPath : function () {},
				isTransient : function () {}
			},
			oContext2 = {
				getPath : function () {},
				isTransient : function () {}
			},
			oFilter1 = new Filter("~Path", FilterOperator.EQ, "foo"),
			oFilter2 = new Filter("~Path", FilterOperator.EQ, "bar");

		oBindingMock.expects("_getCreatedContexts")
			.withExactArgs()
			.returns([oContext0, oContext1, oContext2]);
		this.mock(oContext0).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext2).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext1).expects("getPath").withExactArgs().returns("~sPath('1')");
		this.mock(oContext2).expects("getPath").withExactArgs().returns("~sPath('2')");
		oBindingMock.expects("_getFilterForPredicate").withExactArgs("('1')").returns(oFilter1);
		oBindingMock.expects("_getFilterForPredicate").withExactArgs("('2')").returns(oFilter2);
		this.mock(ODataUtils).expects("_createFilterParams")
			.withExactArgs(sinon.match(function (oFilter) {
					assert.ok(oFilter instanceof Filter);
					assert.deepEqual(oFilter.aFilters, [oFilter1, oFilter2]);
					assert.strictEqual(oFilter.aFilters[0], oFilter1);
					assert.strictEqual(oFilter.aFilters[1], oFilter2);
					assert.strictEqual(oFilter.bAnd, undefined);

					return true;
				}),
				sinon.match.same(oBinding.oModel.oMetadata), "~EntityType")
			.returns("~sExcludeFilter");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getCreatedPersistedExcludeFilter.call(oBinding),
			"not(~sExcludeFilter)");
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedPersistedExcludeFilter: only one persisted context", function (assert) {
		var oBinding = {
				oEntityType : "~EntityType",
				oModel : {
					oMetadata : {}
				},
				_getCreatedContexts : function () {},
				_getFilterForPredicate : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oContext = {
				getPath : function () {},
				isTransient : function () {}
			},
			oFilter = new Filter("~Path", FilterOperator.EQ, "foo");

		oBindingMock.expects("_getCreatedContexts").withExactArgs().returns([oContext]);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("getPath").withExactArgs().returns("~sPath('1')");
		oBindingMock.expects("_getFilterForPredicate").withExactArgs("('1')").returns(oFilter);
		this.mock(ODataUtils).expects("_createFilterParams")
			.withExactArgs(sinon.match.same(oFilter),
				sinon.match.same(oBinding.oModel.oMetadata), "~EntityType")
			.returns("~sExcludeFilter");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getCreatedPersistedExcludeFilter.call(oBinding),
			"not(~sExcludeFilter)");
	});

	//*********************************************************************************************
[
	{excludeFilter : "~sExcludeFilter", result : ["foo", "$filter=~sExcludeFilter"]},
	{result : ["foo"]},
	{filterParams : "$filter=~Filter", useFilterParams : true, result : ["foo", "$filter=~Filter"]},
	{filterParams : "$filter=~Filter", useFilterParams : false, result : ["foo"]},
	{
		excludeFilter : "~sExcludeFilter",
		filterParams : "$filter=~Filter",
		useFilterParams : false,
		result : ["foo", "$filter=~sExcludeFilter"]
	},
	{
		excludeFilter : "~sExcludeFilter",
		filterParams : "$filter=~Filter",
		useFilterParams : true,
		result : ["foo", "$filter=(~Filter)%20and%20~sExcludeFilter"]
	}
].forEach(function (oFixture) {
	var sTitle = "_addFilterQueryOption: exclude filter=" + oFixture.excludeFilter;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				sFilterParams : oFixture.filterParams,
				_getCreatedPersistedExcludeFilter : function () {}
			},
			aURLParams = ["foo"];

		this.mock(oBinding).expects("_getCreatedPersistedExcludeFilter")
			.withExactArgs()
			.returns(oFixture.excludeFilter);

		// code under test
		ODataListBinding.prototype._addFilterQueryOption.call(oBinding, aURLParams,
			oFixture.useFilterParams);

		assert.deepEqual(aURLParams, oFixture.result);
	});
});

	//*********************************************************************************************
[{
	bForceUpdate : true,
	sGroupId : "~sGroupId",
	expectedForceUpdate : true,
	expectedRefreshGroupId : "~sGroupId"
}, {
	bForceUpdate : false,
	sGroupId : "~sGroupId",
	expectedForceUpdate : false,
	expectedRefreshGroupId : "~sGroupId"
}, {
	bForceUpdate : "~sGroupId",
	sGroupId : "~sGroupId2",
	expectedForceUpdate : false,
	expectedRefreshGroupId : "~sGroupId"
}, {
	bForceUpdate : "~sGroupId",
	expectedForceUpdate : false,
	expectedRefreshGroupId : "~sGroupId"
}, {
	expectedForceUpdate : undefined,
	expectedRefreshGroupId : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("refresh: #" + i, function (assert) {
		var oRefreshExpectation, oRemoveExpectation,
			oBinding = {
				sRefreshGroupId : "~foo",
				_refresh : function () {},
				_removePersistedCreatedContexts : function () {}
			};

		oRemoveExpectation = this.mock(oBinding).expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oRefreshExpectation = this.mock(oBinding).expects("_refresh")
			.withExactArgs(oFixture.expectedForceUpdate)
			.callsFake(function () {
				assert.strictEqual(oBinding.sRefreshGroupId, oFixture.expectedRefreshGroupId);
			});

		// code under test
		ODataListBinding.prototype.refresh.call(oBinding, oFixture.bForceUpdate, oFixture.sGroupId);

		assert.ok(oBinding.hasOwnProperty("sRefreshGroupId"));
		assert.strictEqual(oBinding.sRefreshGroupId, undefined);
		assert.ok(oRefreshExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});
});

	//*********************************************************************************************
	QUnit.test("sort: removes persisted created entries", function (assert) {
		var oModel = {resolveDeep : function () {}},
			oBinding = {
				aKeys : "~aKeys",
				bInitial : false,
				iLength : 42,
				oModel : oModel,
				_fireRefresh : function () {},
				_fireSort : function () {},
				_removePersistedCreatedContexts : function () {},
				abortPendingRequest : function () {},
				addComparators : function () {},
				createSortParams : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode").withExactArgs().twice().returns(false);
		this.mock(oBinding).expects("createSortParams").withExactArgs([]);
		this.mock(oBinding).expects("addComparators").withExactArgs([], true);
		this.mock(oBinding).expects("_removePersistedCreatedContexts")
			.withExactArgs()
			.callsFake(function () {
				assert.strictEqual(oBinding.aKeys, "~aKeys");
			})
			.returns(["~persistedContext"]);
		this.mock(oBinding).expects("abortPendingRequest").withExactArgs(false);
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Sort});
		this.mock(oBinding).expects("_fireSort").withExactArgs({sorter : []});


		// code under test
		assert.strictEqual(ODataListBinding.prototype.sort.call(oBinding), oBinding);
		assert.strictEqual(oBinding.iLength, 43);
	});

	//*********************************************************************************************
	QUnit.test("filter: removes persisted created entries", function (assert) {
		var oRemoveExpectation, oResetDataExpectation,
			aApplicationFilters = [],
			oBinding = {
				aApplicationFilters : aApplicationFilters,
				bInitial : false,
				oModel : {checkFilterOperation : function () {}},
				_fireFilter : function () {},
				_fireRefresh : function () {},
				_removePersistedCreatedContexts : function () {},
				addComparators : function () {},
				abortPendingRequest : function () {},
				convertFilters : function () {},
				createFilterParams : function () {},
				resetData : function () {},
				useClientMode : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aFilters = [];

		this.mock(oBinding.oModel).expects("checkFilterOperation")
			.withExactArgs(sinon.match.same(aFilters));
		oBindingMock.expects("convertFilters").withExactArgs();
		this.mock(FilterProcessor).expects("combineFilters")
			.withExactArgs(sinon.match.same(aFilters), sinon.match.same(aApplicationFilters))
			.returns("~oCombinedFilter");
		oBindingMock.expects("useClientMode").withExactArgs().twice().returns(false);
		oBindingMock.expects("createFilterParams").withExactArgs("~oCombinedFilter");
		oBindingMock.expects("addComparators").withExactArgs(sinon.match.same(aFilters));
		oBindingMock.expects("addComparators").withExactArgs(sinon.match.same(aApplicationFilters));
		oRemoveExpectation = oBindingMock.expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oResetDataExpectation = oBindingMock.expects("resetData").withExactArgs();
		oBindingMock.expects("abortPendingRequest").withExactArgs(true);
		oBindingMock.expects("_fireRefresh").withExactArgs({reason : ChangeReason.Filter});
		oBindingMock.expects("_fireFilter").withExactArgs({filters : sinon.match.same(aFilters)});

		// code under test
		assert.strictEqual(ODataListBinding.prototype.filter.call(oBinding, aFilters), oBinding);

		assert.strictEqual(oBinding.aFilters, aFilters);
		assert.strictEqual(oBinding.oCombinedFilter, "~oCombinedFilter");
		assert.ok(oResetDataExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});

	//*********************************************************************************************
	QUnit.test("_removePersistedCreatedContexts", function (assert) {
		var oCreatedContextCache = {
				removePersistedContexts : function () {}
			},
			oModel = {
				_getCreatedContextsCache : function () {},
				_updateBindingsForChangedContexts : function () {}
			},
			oBinding = {
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				oModel : oModel,
				getResolvedPath : function () {}
			};

		this.mock(oModel).expects("_getCreatedContextsCache")
			.withExactArgs()
			.returns(oCreatedContextCache);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oCreatedContextCache).expects("removePersistedContexts")
			.withExactArgs("~resolvedPath", "~sCreatedEntitiesKey")
			.returns("~aRemovedContexts");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._removePersistedCreatedContexts.call(oBinding),
			"~aRemovedContexts");
	});

	//*********************************************************************************************
	QUnit.test("isFirstCreateAtEnd", function (assert) {
		var oCreatedContextCache = {
				isAtEnd : function () {}
			},
			oModel = {
				_getCreatedContextsCache : function () {}
			},
			oBinding = {
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				oModel : oModel,
				getResolvedPath : function () {}
			};

		this.mock(oModel).expects("_getCreatedContextsCache")
			.withExactArgs()
			.returns(oCreatedContextCache);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oCreatedContextCache).expects("isAtEnd")
			.withExactArgs("~resolvedPath", "~sCreatedEntitiesKey")
			.returns("~bAtEnd");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype.isFirstCreateAtEnd.call(oBinding),
			"~bAtEnd");
	});

	//*********************************************************************************************
	QUnit.test("getAllCurrentContexts: Return correct contexts", function (assert) {
		var aAllCurrentContexts,
			oBinding = {
				_getCreatedContexts : function () {},
				oContext : "~oContext",
				// eslint-disable-next-line no-sparse-arrays
				aKeys : ["foo(bar)", /* empty */, "foo(baz)"],
				oModel : {
					getContext : function () {},
					resolveDeep : function () {}
				},
				sPath : "~sPath"
			},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(["~createdContexts"]);
		oModelMock.expects("getContext").withExactArgs("/foo(bar)").returns("~context(bar)");
		oModelMock.expects("getContext").withExactArgs("/foo(baz)").returns("~context(baz)");

		//code under test
		aAllCurrentContexts = ODataListBinding.prototype.getAllCurrentContexts.call(oBinding);

		assert.strictEqual(aAllCurrentContexts.length, 3);
		assert.ok(aAllCurrentContexts.includes("~createdContexts"));
		assert.ok(aAllCurrentContexts.includes("~context(bar)"));
		assert.ok(aAllCurrentContexts.includes("~context(baz)"));
	});

	//*********************************************************************************************
	QUnit.test("attachCreateActivate", function (assert) {
		var oBinding = {attachEvent : function () {}};

		this.mock(oBinding).expects("attachEvent")
			.withExactArgs("createActivate", "~fnFunction", "~oListener");

		// code under test
		ODataListBinding.prototype.attachCreateActivate.call(oBinding, "~fnFunction", "~oListener");
	});

	//*********************************************************************************************
	QUnit.test("detachCreateActivate", function (assert) {
		var oBinding = {detachEvent : function () {}};

		this.mock(oBinding).expects("detachEvent")
			.withExactArgs("createActivate", "~fnFunction", "~oListener");

		// code under test
		ODataListBinding.prototype.detachCreateActivate.call(oBinding, "~fnFunction", "~oListener");
	});

	//*********************************************************************************************
	QUnit.test("getCount, length not final", function (assert) {
		var oBinding = {
				isLengthFinal : function () {}
			};

		this.mock(oBinding).expects("isLengthFinal").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getCount.call(oBinding), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getCount, length final", function (assert) {
		var oBinding = {
				_getCreatedContexts : function () {},
				getLength : function () {},
				isLengthFinal : function () {}
			},
			oContext = {isInactive : function () {}},
			oContext2 = {isInactive : function () {}},
			aCreatedContexts = [oContext, oContext2];

		this.mock(oBinding).expects("isLengthFinal").withExactArgs().returns(true);
		this.mock(oBinding).expects("getLength").withExactArgs().returns(42);
		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(aCreatedContexts);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(true);
		this.mock(oContext2).expects("isInactive").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getCount.call(oBinding), 41);
	});

	//*********************************************************************************************
	QUnit.test("_hasTransientParentContext, absolute binding", function (assert) {
		var oBinding = {isRelative : function () {}};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._hasTransientParentContext.call(oBinding),
			false);
	});

	//*********************************************************************************************
[{ // no context
	oContext : undefined,
	bResult : false
}, { // non-V2 context
	oContext : {},
	bResult : false
}, { // non-transient context
	oContext : {isTransient : function () {}},
	bResult : false,
	bTransient : false
}, { // context with persited data
	oContext : {isTransient : function () {}},
	bResult : false,
	bTransient : undefined
}, { // transient context
	oContext : {isTransient : function () {}},
	bResult : true,
	bTransient : true
}].forEach(function (oFixture, i) {
	QUnit.test("_hasTransientParentContext, relative binding, " + i, function (assert) {
		var oBinding = {
				oContext : oFixture.oContext,
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		if ("bTransient" in oFixture) {
			this.mock(oBinding.oContext).expects("isTransient")
				.withExactArgs()
				.returns(oFixture.bTransient);
		}

		// code under test
		assert.strictEqual(ODataListBinding.prototype._hasTransientParentContext.call(oBinding),
			oFixture.bResult);
	});
});

	//*********************************************************************************************
[{
	bResolved : undefined,
	bResult : true,
	bTransient : true
}, {
	bResolved : false,
	bResult : true,
	bTransient : false
}, {
	bResolved : true,
	bResult : false,
	bTransient : false
}].forEach(function (oFixture, i) {
	QUnit.test("resetData: set bLengthFinal #" + i, function (assert) {
		var oBinding = {
				_hasTransientParentContext : function () {},
				isResolved : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext")
			.withExactArgs()
			.returns(oFixture.bTransient);
		this.mock(oBinding).expects("isResolved")
			.withExactArgs()
			.exactly(oFixture.bResolved === undefined ? 0 : 1)
			.returns(oFixture.bResolved);

		// code under test
		ODataListBinding.prototype.resetData.call(oBinding);

		assert.strictEqual(oBinding.bLengthFinal, oFixture.bResult);
	});
});
});