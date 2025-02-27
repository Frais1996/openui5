sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-media-gallery-root" dir=${litRender.ifDefined(context.effectiveDir)}><div class="ui5-media-gallery-display-wrapper"><div class="ui5-media-gallery-display" @click="${context._onDisplayAreaClick}">${ context._isPhonePlatform ? block1(context, tags, suffix) : block3(context, tags, suffix) }</div></div>${ context._showThumbnails ? block4(context, tags, suffix) : undefined }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-carousel", tags, suffix)} @ui5-navigate="${litRender.ifDefined(context._onCarouselNavigate)}" hide-navigation-arrows>${ litRender.repeat(context._selectableItems, (item, index) => item._id || index, (item, index) => block2(item)) }</${litRender.scopeTag("ui5-carousel", tags, suffix)}>`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`<slot name="${litRender.ifDefined(item._individualSlot)}"></slot>`;
	const block3 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-media-gallery-item", tags, suffix)} ?_interactive="${litRender.ifDefined(context.interactiveDisplayArea)}" ?_square="${litRender.ifDefined(context._shouldHaveSquareDisplay)}" _tab-index="${litRender.ifDefined(context._mainItemTabIndex)}"></${litRender.scopeTag("ui5-media-gallery-item", tags, suffix)}>`;
	const block4 = (context, tags, suffix) => litRender.html`<div class="ui5-media-gallery-thumbnails-wrapper"><ul>${ litRender.repeat(context._visibleItems, (item, index) => item._id || index, (item, index) => block5(item, index, context)) }${ context._showOverflowBtn ? block6(context, tags, suffix) : undefined }</ul></div>`;
	const block5 = (item, index, context, tags, suffix) => litRender.html`<li id="${litRender.ifDefined(item.id)}" class="ui5-media-gallery-thumbnail" role="option" @click="${context._onThumbnailClick}" @ui5-click="${litRender.ifDefined(context._onThumbnailClick)}"><slot name="${litRender.ifDefined(item._individualSlot)}"></slot></li>`;
	const block6 = (context, tags, suffix) => litRender.html`<li class="ui5-media-gallery-overflow"><${litRender.scopeTag("ui5-button", tags, suffix)} @click="${context._onOverflowBtnClick}">+${litRender.ifDefined(context._overflowSize)}</${litRender.scopeTag("ui5-button", tags, suffix)}></li>`;

	return block0;

});
