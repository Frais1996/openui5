sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	// Please order topics alphabetically by "title"
	return new JSONModel({
		selectedKey: 'gettingStarted',
		navigation: [
			{
				title: 'Getting Started',
				icon: 'sap-icon://initiative',
				target: 'learnDetail',
				key: 'gettingStarted'
			},
			{
				title: 'Card Headers',
				icon: 'sap-icon://header',
				target: 'learnDetail',
				key: 'headers',
				items: [
					{
						title: 'Default',
						target: 'learnDetail',
						key: 'default'
					},
					{
						title: 'Numeric',
						target: 'learnDetail',
						key: 'numeric'
					}
				]
			},
			{
				title: 'Declarative Card Types',
				icon: 'sap-icon://SAP-icons-TNT/requirement-diagram',
				target: 'learnDetail',
				key: 'typesDeclarative',
				items: [
					{
						title: 'List',
						target: 'learnDetail',
						key: 'list'
					},
					{
						title: 'Object',
						target: 'learnDetail',
						key: 'object'
					},
					{
						title: 'Table',
						target: 'learnDetail',
						key: 'table'
					},
					{
						title: 'Analytical',
						target: 'learnDetail',
						key: 'analytical'
					},
					{
						title: 'Calendar',
						target: 'learnDetail',
						key: 'calendar'
					},
					{
						title: 'Timeline',
						target: 'learnDetail',
						key: 'timeline'
					}
				]
			},
			{
				title: 'Other Card Types',
				icon: 'sap-icon://SAP-icons-TNT/internal-block-diagram',
				target: 'learnDetail',
				key: 'typesOther',
				items: [
					{
						title: 'Adaptive',
						target: 'learnDetail',
						key: 'adaptive'
					},
					{
						title: 'Component',
						target: 'learnDetail',
						key: 'component'
					},
					{
						title: 'WebPage',
						target: 'learnDetail',
						key: 'webPage',
						experimental: true
					}
				]
			},
			{
				title: 'Card Footer',
				key: 'footer',
				target: 'learnDetail',
				icon: 'sap-icon://SAP-icons-TNT/local-process-call',
				experimental: true
			},
			{
				title: 'Card Configuration',
				key: 'configuration',
				target: 'learnDetail',
				icon: 'sap-icon://settings',
				items: [
					{
						title: 'Action Handlers',
						target: 'learnDetail',
						key: 'actionHandlers'
					},
					{
						title: 'Custom Error Message',
						target: 'learnDetail',
						key: 'customErrorMessages',
						experimental: true
					},
					{
						title: 'CSRF Tokens',
						target: 'learnDetail',
						key: 'csrfTokens',
						experimental: true
					},
					{
						title: 'Destinations',
						target: 'learnDetail',
						key: 'destinations'
					},
					{
						title: 'Manifest Parameters',
						target: 'learnDetail',
						key: 'manifestParameters'
					}
				]
			},
			{
				title: 'Card Filters',
				key: "filters",
				target: 'learnDetail',
				icon: 'sap-icon://filter',
				items: [
					{
						title: 'DateRange',
						target: 'learnDetail',
						key: 'dateRange',
						experimental: true
					},
					{
						title: 'Search',
						target: 'learnDetail',
						key: 'search',
						experimental: true
					},
					{
						title: 'Select',
						target: 'learnDetail',
						key: 'select'
					}
				]
			},
			{
				title: 'Card Features',
				icon: 'sap-icon://activities',
				target: 'learnDetail',
				key: 'features',
				items: [
					{
						title: 'Actions',
						target: 'learnDetail',
						key: 'cardActions'
					},
					{
						title: 'Data',
						target: 'learnDetail',
						key: 'data'
					},
					{
						title: 'Date Ranges',
						target: 'learnDetail',
						key: 'dateRanges',
						experimental: true
					},
					{
						title: 'Dynamic Counter',
						target: 'learnDetail',
						key: 'dynamicCounter'
					},
					{
						title: 'Dynamic Parameters',
						target: 'learnDetail',
						key: 'dynamicParameters'
					},
					{
						title: 'Extension',
						target: 'learnDetail',
						key: 'extension'
					},
					{
						title: 'Microcharts',
						target: 'learnDetail',
						key: 'microcharts',
						experimental: true
					},
					{
						title: 'Pagination',
						target: 'learnDetail',
						key: 'pagination',
						experimental: true
					},
					{
						title: 'Sizing',
						target: 'learnDetail',
						key: 'sizing',
						topicTitle: 'Sizing'
					},
					{
						title: 'Translation',
						target: 'learnDetail',
						key: 'translation'
					}
				]
			},
			{
				title: 'Card Bundle',
				icon: 'sap-icon://attachment-zip-file',
				target: 'learnDetail',
				key: 'bundle'
			},
			{
				title: 'Card Formatters',
				icon: 'sap-icon://text-formatting',
				target: 'learnDetail',
				key: 'formatters',
				items: [
					{
						title: 'Currency',
						target: 'learnDetail',
						key: 'currency'
					},
					{
						title: 'Date and Time',
						target: 'learnDetail',
						key: 'dateAndTime'
					},
					{
						title: 'Float',
						target: 'learnDetail',
						key: 'float'
					},
					{
						title: 'Integer',
						target: 'learnDetail',
						key: 'integer'
					},
					{
						title: 'Percent',
						target: 'learnDetail',
						key: 'percent'
					},
					{
						title: 'Text',
						target: 'learnDetail',
						key: 'text'
					},
					{
						title: 'Unit of Measurement',
						target: 'learnDetail',
						key: 'unit'
					}
				]
			}
		]
	});
});
