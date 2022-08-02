import { renderToString } from 'react-dom/server';

import { Svg } from './Svg';

test('Svg', () => {
  const string = renderToString(
    <Svg
      alt="arrow"
      src={{
        tag: 'svg',
        props: {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'currentColor',
          viewBox: '0 0 24 24',
        },
        children: [
          {
            tag: 'path',
            props: {
              d: 'M12 5.097 1.299 15.798l2.515 2.515L12 10.144l8.186 8.169 2.515-2.515z',
            },
          },
        ],
      }}
    />,
  );
  expect(string).toMatchInlineSnapshot(
    '"<i role=\\"img\\" aria-label=\\"arrow\\" aria-hidden=\\"false\\"><svg xmlns=\\"http://www.w3.org/2000/svg\\" fill=\\"currentColor\\" viewBox=\\"0 0 24 24\\" width=\\"100%\\" height=\\"100%\\" aria-hidden=\\"true\\"><path d=\\"M12 5.097 1.299 15.798l2.515 2.515L12 10.144l8.186 8.169 2.515-2.515z\\"></path></svg></i>"',
  );
});
