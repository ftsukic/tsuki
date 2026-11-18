package com.ftsukic.tsukinative.selectabletext

import android.view.ViewGroup
import android.widget.TextView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

class TsukiSelectableTextView(context: ThemedReactContext) : ViewGroup(context) {
    private val textView = TextView(context)
    private var lastWidth = -1
    private var lastHeight = -1
    private val updateContentLayout = Runnable { layoutText() }

    init {
        addView(textView)
    }

    fun setContentText(text: String?) {
        textView.text = text
        scheduleContentLayout()
    }

    private fun scheduleContentLayout() {
        removeCallbacks(updateContentLayout)
        if (isAttachedToWindow) post(updateContentLayout)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        scheduleContentLayout()
    }

    override fun onDetachedFromWindow() {
        removeCallbacks(updateContentLayout)
        super.onDetachedFromWindow()
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        layoutText()
    }

    private fun layoutText() {
        val availableWidth = width - paddingLeft - paddingRight
        if (availableWidth <= 0) return

        textView.measure(
            MeasureSpec.makeMeasureSpec(availableWidth, MeasureSpec.AT_MOST),
            MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED),
        )
        val contentWidth = textView.measuredWidth
        val contentHeight = textView.measuredHeight
        textView.layout(
            paddingLeft, paddingTop, paddingLeft + contentWidth, paddingTop + contentHeight,
        )

        if (!isAttachedToWindow || id == NO_ID) return
        if (contentWidth == lastWidth && contentHeight == lastHeight) return
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(
            context as ThemedReactContext, id,
        ) ?: return
        lastWidth = contentWidth
        lastHeight = contentHeight
        dispatcher.dispatchEvent(
            ContentSizeChangeEvent(
                UIManagerHelper.getSurfaceId(this),
                id,
                PixelUtil.toDIPFromPixel(contentWidth.toFloat()).toDouble(),
                PixelUtil.toDIPFromPixel(contentHeight.toFloat()).toDouble(),
            ),
        )
    }

    private class ContentSizeChangeEvent(
        surfaceId: Int,
        viewId: Int,
        private val width: Double,
        private val height: Double,
    ) : Event<ContentSizeChangeEvent>(surfaceId, viewId) {
        override fun getEventName() = EVENT_NAME

        override fun getEventData(): WritableMap = Arguments.createMap().apply {
            putDouble("width", width)
            putDouble("height", height)
        }
    }

    companion object {
        const val EVENT_NAME = "topContentSizeChange"
    }
}
