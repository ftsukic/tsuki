package com.ftsukic.tsukinative.selectabletext

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.viewmanagers.TsukiSelectableTextManagerDelegate
import com.facebook.react.viewmanagers.TsukiSelectableTextManagerInterface

class TsukiSelectableTextManager : SimpleViewManager<TsukiSelectableTextView>(),
    TsukiSelectableTextManagerInterface<TsukiSelectableTextView> {
    private val viewDelegate = TsukiSelectableTextManagerDelegate(this)

    override fun getDelegate() = viewDelegate

    override fun getName() = "TsukiSelectableText"

    override fun createViewInstance(context: ThemedReactContext) = TsukiSelectableTextView(context)

    override fun setText(view: TsukiSelectableTextView, value: String?) = view.setContentText(value)

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> = mapOf(
        TsukiSelectableTextView.EVENT_NAME to mapOf("registrationName" to "onContentSizeChange"),
    )
}
