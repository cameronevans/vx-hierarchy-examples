import React, { useState } from 'react';
import { hierarchy } from 'd3-hierarchy';
import { ParentSize } from '@vx/responsive';
import preval from 'babel-plugin-preval/macro';

import './styles.css';

import hierarchyData from './data/hierarchy';
import IcicleHorizontal from './examples/IcicleHorizontal';
import IcicleVertical from './examples/IcicleVertical';
import Sunburst from './examples/Sunburst';
import Sankey from './examples/Sankey';
import Tree from './examples/Tree';
import Treemap from './examples/Treemap';

import Node from './examples/Node';

import { graphFromCsv } from './graph/utils';
import graph from './data/graph';

const root = hierarchy<any>(hierarchyData)
  .eachBefore(
    (d) => (d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
  )
  .sum((d) => d.size)
  // .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  .sort((a, b) => b.height - a.height || (b.value ?? 0) - (a.value ?? 0));

console.log({ root });

// const csv = preval`
//   const fs = require('fs')
//   module.exports = fs.readFileSync(require.resolve('./data/graph.csv'), 'utf8')
// `;
// const graph = graphFromCsv(csv);
// const graph = {
//   nodes: root.descendants().map((node) => node.data),
//   links: root.links().map((link) => {
//     return {
//       source: link.source.data.name,
//       target: link.target.data.name,
//       value: link.target.value,
//     };
//   }),
// };
console.log({ graph });

export default function App() {
  const [layout, setLayout] = useState<
    | 'IcicleVertical'
    | 'IcicleHorizontal'
    | 'Sunburst'
    | 'Treemap'
    | 'Sankey'
    | 'Tree'
  >('Tree');

  return (
    <div>
      <div
        style={{
          display: 'inline-grid',
          gridGap: 8,
          gridAutoFlow: 'column',
          gridAutoColumns: 'auto',
        }}
      >
        <label>
          <input
            type="radio"
            checked={layout === 'IcicleVertical'}
            onChange={() => setLayout('IcicleVertical')}
          />
          Icicle Vertical
        </label>
        <label>
          <input
            type="radio"
            checked={layout === 'IcicleHorizontal'}
            onChange={() => setLayout('IcicleHorizontal')}
          />
          Icicle Horizontal
        </label>
        <label>
          <input
            type="radio"
            checked={layout === 'Treemap'}
            onChange={() => setLayout('Treemap')}
          />
          Treemap
        </label>
        <label>
          <input
            type="radio"
            checked={layout === 'Sunburst'}
            onChange={() => setLayout('Sunburst')}
          />
          Sunburst
        </label>
        <label>
          <input
            type="radio"
            checked={layout === 'Sankey'}
            onChange={() => setLayout('Sankey')}
          />
          Sankey
        </label>
        <label>
          <input
            type="radio"
            checked={layout === 'Tree'}
            onChange={() => setLayout('Tree')}
          />
          Tree
        </label>
      </div>

      <ParentSize>
        {(size) =>
          size.ref &&
          (layout === 'IcicleVertical' ? (
            <IcicleVertical root={root} width={size.width} height={800} />
          ) : layout === 'IcicleHorizontal' ? (
            <IcicleHorizontal root={root} width={size.width} height={800} />
          ) : layout === 'Sunburst' ? (
            <div
              style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Sunburst
                root={root}
                width={Math.min(size.width, size.height) * 0.8}
                height={Math.min(size.width, size.height) * 0.8}
              />
            </div>
          ) : layout === 'Sankey' ? (
            <Sankey
              graph={graph}
              // nodeId={(d: any) => d.name}
              width={size.width - 100}
              height={800}
              // height={10000}
            />
          ) : layout === 'Treemap' ? (
            <Treemap root={root} width={960} height={600} />
          ) : layout === 'Tree' ? (
            <Tree
              data={hierarchyData}
              nodeId={(d) => d.id}
              renderNode={(node, onClick) => {
                // console.log('node', node);
                return (
                  <Node node={node} onClick={onClick} width={192} height={24} />
                );
              }}
              nodeWidth={192 * 1.5}
              nodeHeight={24 + 16}
              width={size.width}
              // height={size.height}
              height={800}
            />
          ) : null)
        }
      </ParentSize>
    </div>
  );
}
