import classNames from 'classnames'
import {
  useLiveDemo,
  useLocale,
  useLocation,
  useRouteMeta,
  useSiteData,
  type IPreviewerProps,
} from 'dumi'
import Device from 'dumi/theme/slots/Device'
import PreviewerActions from 'dumi-theme-mobile/dist/slots/PreviewerActions'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import 'dumi/theme-default/builtins/Previewer/index.less'
import 'dumi-theme-mobile/dist/builtins/Previewer/index.less'

function LivePreviewer(props: IPreviewerProps) {
  const demoContainer = useRef<HTMLDivElement>(null)
  const { hash } = useLocation()
  const link = `#${props.asset.id}`
  const { node, error, loading, setSource } = useLiveDemo(props.asset.id, {
    iframe: Boolean(props.iframe || props._live_in_iframe),
    containerRef: demoContainer,
  })

  const previewNode = node || props.children

  return (
    <div
      id={props.asset.id}
      className={classNames('dumi-default-previewer', props.className)}
      style={props.style}
      data-debug={props.debug || undefined}
      data-active={hash === link || undefined}
    >
      <div
        ref={demoContainer}
        className="dumi-default-previewer-demo"
        style={{ background: props.background }}
        data-compact={props.compact || undefined}
        data-transform={props.transform || undefined}
        data-iframe={props.iframe || undefined}
        data-error={Boolean(error) || undefined}
        data-loading={loading || undefined}
      >
        {props.iframe ? (
          <iframe
            style={
              typeof props.iframe === 'string' || typeof props.iframe === 'number'
                ? { height: Number(props.iframe) }
                : {}
            }
            src={props.demoUrl}
          />
        ) : (
          previewNode
        )}
      </div>
      {error ? <div className="dumi-default-previewer-demo-error">{error.toString()}</div> : null}
      <div className="dumi-default-previewer-meta">
        {props.title || props.debug ? (
          <div className="dumi-default-previewer-desc">
            <h5>
              <a href={link}>
                {props.debug ? <strong>DEV ONLY</strong> : null}
                {props.title}
              </a>
            </h5>
            {props.description ? (
              <div className="markdown" dangerouslySetInnerHTML={{ __html: props.description }} />
            ) : null}
          </div>
        ) : null}
        <PreviewerActions
          {...props}
          onSourceChange={setSource}
          demoContainer={demoContainer.current as HTMLDivElement}
        />
      </div>
    </div>
  )
}

export default function Previewer(props: IPreviewerProps) {
  const { frontmatter } = useRouteMeta()
  const { themeConfig } = useSiteData()
  const locale = useLocale()
  const mobile = frontmatter.mobile !== false
  const generateUrl = useCallback(
    (value: IPreviewerProps) => {
      const [pathname, search] = value.demoUrl.split('?')
      const params = new URLSearchParams(search)

      if (value.compact) params.set('compact', '')
      if (value.background) params.set('background', value.background)
      if (locale.id) params.set('locale', locale.id)

      return `${pathname}?${params.toString()}`.replace(/\?$/, '')
    },
    [locale.id],
  )
  const [demoUrl, setDemoUrl] = useState(() => generateUrl(props))

  useEffect(() => {
    setDemoUrl(generateUrl(props))
  }, [generateUrl, props.background, props.compact])

  return (
    <LivePreviewer
      {...props}
      demoUrl={demoUrl}
      iframe={mobile ? false : props.iframe}
      className={mobile ? 'dumi-mobile-previewer' : undefined}
      forceShowCode={mobile}
      style={{
        ...props.style,
        '--device-width': themeConfig.deviceWidth ? `${themeConfig.deviceWidth}px` : undefined,
      }}
      _live_in_iframe={mobile}
    >
      {mobile ? (
        <Device
          url={demoUrl}
          inlineHeight={typeof props.iframe === 'number' ? props.iframe : undefined}
        />
      ) : (
        props.children
      )}
    </LivePreviewer>
  )
}
