#import "TsukiSelectableTextComponentView.h"

#import <UIKit/UIKit.h>
#import <React/RCTConversions.h>
#import <react/renderer/components/TsukiNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/TsukiNativeSpec/EventEmitters.h>
#import <react/renderer/components/TsukiNativeSpec/Props.h>
#import <react/renderer/components/TsukiNativeSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface TsukiSelectableTextComponentView () <RCTTsukiSelectableTextViewProtocol>
@end

@implementation TsukiSelectableTextComponentView {
  UILabel *_label;
  CGSize _lastContentSize;
  BOOL _hasReportedContentSize;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<TsukiSelectableTextComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    static const auto defaultProps = std::make_shared<const TsukiSelectableTextProps>();
    _props = defaultProps;
    _label = [[UILabel alloc] initWithFrame:CGRectZero];
    _label.numberOfLines = 0;
    _label.lineBreakMode = NSLineBreakByWordWrapping;
    self.contentView = _label;
  }
  return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &nextProps = static_cast<const TsukiSelectableTextProps &>(*props);
  _label.text = [[NSString alloc] initWithBytes:nextProps.text.data()
                                         length:nextProps.text.size()
                                       encoding:NSUTF8StringEncoding];
  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];
  [self setNeedsLayout];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  CGRect contentFrame = RCTCGRectFromRect(_layoutMetrics.getContentFrame());
  if (CGRectGetWidth(contentFrame) <= 0) {
    return;
  }

  CGSize size = [_label sizeThatFits:CGSizeMake(CGRectGetWidth(contentFrame), CGFLOAT_MAX)];
  contentFrame.size.height = MIN(size.height, CGRectGetHeight(contentFrame));
  _label.frame = contentFrame;

  if (!_eventEmitter || (_hasReportedContentSize && CGSizeEqualToSize(size, _lastContentSize))) {
    return;
  }

  _lastContentSize = size;
  _hasReportedContentSize = YES;
  auto emitter = std::static_pointer_cast<const TsukiSelectableTextEventEmitter>(_eventEmitter);
  emitter->onContentSizeChange({
    .width = static_cast<Float>(size.width),
    .height = static_cast<Float>(size.height),
  });
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  _label.text = nil;
  _hasReportedContentSize = NO;
}

@end
