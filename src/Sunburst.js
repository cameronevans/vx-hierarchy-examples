import React, { useState, useEffect, useRef } from 'react';
import { Group } from '@vx/group';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { interpolate as d3interpolate } from 'd3-interpolate';
import { format as d3format } from 'd3-format';
import { useSpring, animated } from 'react-spring';

import Partition from './Partition';

var color = scaleOrdinal().range([
  '#FE938C',
  '#E6B89C',
  '#EAD2AC',
  '#9CAFB7',
  '#4281A4'
]);
// const color = scaleOrdinal(schemeCategory20c);
const format = d3format(',d');

function Sunburst(props) {
  const {
    root,
    width,
    height,
    margin = { top: 0, left: 0, right: 0, bottom: 0 }
  } = props;

  const [state, setState] = useState({
    xDomain: [0, props.width],
    xRange: [0, props.width],
    yDomain: [0, props.height],
    yRange: [0, props.height]
  });

  // console.log({ props });

  const xScale = useRef(
    scaleLinear()
      .domain(state.xDomain)
      .range(state.xRange)
  );
  const yScale = useRef(
    scaleLinear()
      .domain(state.yDomain)
      .range(state.yRange)
  );

  // useEffect(() => {
  //   setState(state => ({
  //     ...state,
  //     yRange: [state.yRange[0], props.width / 2]
  //   }));
  // }, [props.width]);

  const xd = d3interpolate(xScale.current.domain(), state.xDomain);
  const yd = d3interpolate(yScale.current.domain(), state.yDomain);
  const yr = d3interpolate(yScale.current.range(), state.yRange);

  const { t } = useSpring({
    native: true,
    reset: true,
    from: { t: 0 },
    to: { t: 1 },
    config: {
      mass: 5,
      tension: 500,
      friction: 100,
      precision: 0.00001
    },
    onFrame: ({ t }) => {
      xScale.current.domain(xd(t));
      yScale.current.domain(yd(t)).range(yr(t));
    }
  });

  return (
    <svg width={width} height={height}>
      <Partition
        top={margin.top}
        left={margin.left}
        root={root}
        size={[width, height]}
        padding={1}
        round={true}
      >
        <Group>
          {root.descendants().map((node, i) => (
            <animated.g
              // top={yScale.current(node.y0)}
              // left={xScale.current(node.x0)}
              //transform={`translate(${xScale.current(node.x0)}, ${yScale.current(node.y0)})`}
              transform={t.interpolate(
                () =>
                  `translate(${xScale.current(node.x0)}, ${yScale.current(
                    node.y0
                  )})`
              )}
              key={`node-${i}`}
              onClick={() => {
                setState({
                  ...state,
                  xDomain: [node.x0, node.x1],
                  yDomain: [node.y0, props.height],
                  yRange: [node.depth ? 20 : 0, props.height]
                });
              }}
            >
              <animated.rect
                id={`rect-${i}`}
                width={t.interpolate(
                  () => xScale.current(node.x1) - xScale.current(node.x0)
                )}
                height={t.interpolate(
                  () => yScale.current(node.y1) - yScale.current(node.y0)
                )}
                fill={
                  node.children
                    ? '#ddd'
                    : color(node.data.id.split('.').slice(0, 2))
                }
                fillOpacity={node.children ? 1 : 0.6}
              />

              <clipPath id={`clip-${i}`}>
                <use xlinkHref={`#rect-${i}`} />
              </clipPath>

              <text
                x={4}
                y={13}
                clipPath={`url(#clip-${i})`}
                style={{
                  font: '10px sans-serif',
                  fontWeight: 'bold'
                }}
              >
                {node.data.name}
                <tspan
                  style={{
                    fontSize: 9,
                    fillOpacity: 0.8
                  }}
                >
                  {' '}
                  {format(node.value)}
                </tspan>
              </text>
            </animated.g>
          ))}
        </Group>
      </Partition>
    </svg>
  );

  return (
    <svg width={width} height={height}>
      <Partition top={margin.top} left={margin.left} root={root}>
        <Group top={height / 2} left={width / 2}>
          {root.descendants().map((node, i) => (
            <animated.path
              className="path"
              d={t.interpolate(() => arc(node))}
              stroke="#373737"
              strokeWidth="2"
              fill={color((node.children ? node.data : node.parent.data).name)}
              fillRule="evenodd"
              onClick={() => {
                setState({
                  ...state,
                  xDomain: [node.x0, node.x1],
                  yDomain: [node.y0, 1],
                  yRange: [node.y0 ? 20 : 0, props.width / 2]
                });
              }}
              key={i}
            />
          ))}
        </Group>
      </Partition>
    </svg>
  );
}

export default Sunburst;
