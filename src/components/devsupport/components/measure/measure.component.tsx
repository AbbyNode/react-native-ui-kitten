/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React, { useLayoutEffect } from 'react';
import {
  findNodeHandle,
  UIManager,
  StatusBar,
} from 'react-native';
import { Frame } from './type';

export interface MeasureElementProps {
  force?: boolean;
  shouldUseTopInsets?: boolean;
  onMeasure: (frame: Frame) => void;
  children: React.ReactElement;
}

export type MeasuringElement = React.ReactElement;
/**
 * Measures child element size and it's screen position asynchronously.
 * Returns measure result in `onMeasure` callback.
 *
 * Usage:
 *
 * ```tsx
 * const onMeasure = (frame: Frame): void => {
 *   const { x, y } = frame.origin;
 *   const { width, height } = frame.size;
 *   ...
 * };
 *
 * <MeasureElement
 *   shouldUseTopInsets={ModalService.getShouldUseTopInsets}
 *   onMeasure={onMeasure}>
 *   <ElementToMeasure />
 * </MeasureElement>
 * ```
 *
 * By default, it measures each time onLayout is called,
 * but `force` property may be used to measure any time it's needed.
 * DON'T USE THIS FLAG IF THE COMPONENT RENDERS FIRST TIME OR YOU KNOW `onLayout` WILL BE CALLED.
 */
export const MeasureElement: React.FC<MeasureElementProps> = (props): MeasuringElement => {

  const ref = React.useRef(this as MeasuringElement);

  const bindToWindow = (frame: Frame, window: Frame): Frame => {
    if (frame.origin.x < window.size.width) {
      return frame;
    }

    const boundFrame: Frame = new Frame(
      frame.origin.x - window.size.width,
      frame.origin.y,
      frame.size.width,
      frame.size.height,
    );

    return bindToWindow(boundFrame, window);
  };

  const measureSelf = (): void => {
    if (!ref.current || typeof ref.current.getBoundingClientRect !== 'function') {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const originY = props.shouldUseTopInsets ? rect.y + StatusBar.currentHeight || 0 : rect.y;
    const frame: Frame = bindToWindow(new Frame(rect.x, originY, rect.width, rect.height), Frame.window());
    props.onMeasure(frame);
  };

  if (props.force) {
    measureSelf();
  }

  useLayoutEffect(() => {
    measureSelf();
  }, [props.force, ref.current]);

  return React.cloneElement(props.children, { ref });
};

MeasureElement.defaultProps = {
  shouldUseTopInsets: false,
};
