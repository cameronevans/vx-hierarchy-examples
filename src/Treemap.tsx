import React, { useState } from 'react';
import { treemapBinary, HierarchyRectangularNode } from 'd3-hierarchy';
import { scaleOrdinal, ScaleOrdinal, scaleLinear, ScaleLinear } from 'd3-scale';
import { quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { Treemap as VxTreemap } from '@vx/hierarchy';
import { animated } from 'react-spring';
import { useAnimatedScale } from './scales/AnimatedScale';

// Derived from: https://observablehq.com/@d3/zoomable-treemap
function Treemap(props: any) {
  const {
    root,
    width,
    height,
    margin = { top: 0, left: 0, right: 0, bottom: 0 },
  } = props;

  const color = scaleOrdinal(
    quantize(interpolateRainbow, root.children.length + 1)
  );

  const xAnimatedScale = useAnimatedScale(scaleLinear, {
    domain: [0, props.width],
    range: [0, props.width],
  });

  const yAnimatedScale = useAnimatedScale(scaleLinear, {
    domain: [0, props.height],
    range: [0, props.height],
  });

  return (
    <svg width={width} height={height}>
      <VxTreemap<any>
        top={margin.top}
        left={margin.left}
        root={root}
        size={[width, height]}
        // tile={treemapBinary}
        tile={(node, x0, y0, x1, y1) => {
          // This custom tiling function adapts the built-in binary tiling function for the appropriate aspect ratio when the treemap is zoomed-in.
          treemapBinary(node, 0, 0, width, height);
          for (const child of node.children ?? []) {
            child.x0 = x0 + (child.x0 / width) * (x1 - x0);
            child.x1 = x0 + (child.x1 / width) * (x1 - x0);
            child.y0 = y0 + (child.y0 / height) * (y1 - y0);
            child.y1 = y0 + (child.y1 / height) * (y1 - y0);
          }
        }}
        // round={true}
        // paddingInner={1}
      >
        {(data) => (
          <Node
            rootNode={data}
            color={color}
            xAnimatedScale={xAnimatedScale as any}
            yAnimatedScale={yAnimatedScale as any}
          />
        )}
      </VxTreemap>
    </svg>
  );
}

type NodeProps = {
  rootNode: HierarchyRectangularNode<any>;
  color: ScaleOrdinal<string, string>;
  xAnimatedScale: ReturnType<typeof useAnimatedScale>;
  yAnimatedScale: ReturnType<typeof useAnimatedScale>;
};

function Node(props: NodeProps) {
  const { xAnimatedScale, yAnimatedScale } = props;

  const [selectedNode, setSelectedNode] = useState<
    HierarchyRectangularNode<any>
  >();

  return (
    <>
      {props.rootNode.children?.map((node, i) => {
        const nodeId = node.data.id;
        return (
          <animated.g
            transform={xAnimatedScale.interpolate(
              () =>
                `translate(${xAnimatedScale.scale(
                  node.x0
                )}, ${yAnimatedScale.scale(node.y0)})`
            )}
            // style={{ pointerEvents: selectedNode ? 'none' : undefined }}
            key={`node-${nodeId}`}
            onClick={() => {
              if (node.children) {
                xAnimatedScale.setState((prevState) => ({
                  ...prevState,
                  domain: [node.x0, node.x1],
                }));
                yAnimatedScale.setState((prevState) => ({
                  ...prevState,
                  domain: [node.y0, node.y1],
                }));
                setSelectedNode(node);
              }
            }}
          >
            <animated.rect
              id={`rect-${nodeId}`}
              width={xAnimatedScale.interpolate(
                () =>
                  xAnimatedScale.scale(node.x1) - xAnimatedScale.scale(node.x0)
              )}
              height={yAnimatedScale.interpolate(
                () =>
                  yAnimatedScale.scale(node.y1) - yAnimatedScale.scale(node.y0)
              )}
              // fill={node.parent ? props.color(node.parent.data.id) : undefined}
              // fillOpacity={node.children ? 1 : 0.7}
              fill={node.children ? '#ccc' : '#ddd'}
              stroke="#fff"
              // stroke="rgba(255,255,255,.3)"
              // stroke="rgba(0,0,0,.5)"
            />
            <clipPath id={`clip-${nodeId}`}>
              <use xlinkHref={`#rect-${nodeId}`} />
            </clipPath>
            <text
              x={4}
              y={13}
              clipPath={`url(#clip-${nodeId})`}
              style={{
                font: '10px sans-serif',
                fontWeight: 'bold',
              }}
            >
              {node.data.name} ({node.children?.length ?? 0})
            </text>
          </animated.g>
        );
      })}
      {selectedNode && (
        <Node
          rootNode={selectedNode}
          color={props.color}
          xAnimatedScale={xAnimatedScale}
          yAnimatedScale={yAnimatedScale}
        />
      )}
      )}
    </>
  );
}

export default Treemap;
