import React from 'react';
import { Group } from '@vx/group';
import { useTransition, animated } from 'react-spring';

import Link, { LinkProps } from './Link';
import { findCollapsedParent } from './utils/treeUtils';

interface LinkData {
  source: any;
  target: any;
}

type LinksProps = {
  links: LinkData[];
  getKey: (node: any) => React.Key;
} & Omit<LinkProps, 'sx' | 'sy' | 'tx' | 'ty' | 'ref'>;

const AnimatedLink = animated(Link);

// TODO: Offset based on nodeWidth

function Links(props: LinksProps) {
  const { links, getKey, ...linkProps } = props;
  const transitions = useTransition<LinkData, any>(
    links,
    (link) => `${getKey(link.source.data)}_${getKey(link.target.data)}`,
    {
      from: ({ source, target }) => ({
        sx: source.data.x0 ?? source.x,
        sy: source.data.y0 ?? source.y,
        tx: source.data.x0 ?? target.x,
        ty: source.data.y0 ?? target.y,
      }),
      enter: ({ source, target }) => ({
        sx: source.x,
        sy: source.y,
        tx: target.x,
        ty: target.y,
      }),
      update: ({ source, target }) => ({
        sx: source.x,
        sy: source.y,
        tx: target.x,
        ty: target.y,
      }),
      leave: ({ source, target }) => {
        const collapsedParent = findCollapsedParent(source);
        return {
          sx: collapsedParent.data.x0 ?? collapsedParent.x,
          sy: collapsedParent.data.y0 ?? collapsedParent.y,
          tx: collapsedParent.data.x0 ?? collapsedParent.x,
          ty: collapsedParent.data.y0 ?? collapsedParent.y,
        };
      },
    }
  );

  return (
    <Group>
      {transitions.map(({ item, props, key }) => (
        <AnimatedLink
          sx={props.sx}
          sy={props.sy}
          tx={props.tx}
          ty={props.ty}
          {...linkProps}
          key={key}
        />
      ))}
    </Group>
  );
}

export default Links;
