# SVJ React - React component to render [SVJ](https://www.npmjs.com/package/svj) CLI output JSON

## Installation

```sh
npm i -D @svjson/react
```

## Usage

### Given the generated JSON

```js
export const lightbulb = {
  tag: 'svg',
  props: {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'currentColor',
    version: '1.1',
    viewBox: '0 0 24 24',
  },
  children: [
    {
      tag: 'path',
      props: {
        strokeWidth: '1.569',
        d: 'M8.925 21.224c0 .512.41 1.025 1.025 1.025h4.1c.615 0 1.025-.513 1.025-1.025V20.2h-6.15ZM12 1.751a7.13 7.13 0 0 0-7.174 7.174c0 2.46 1.23 4.612 3.074 5.842v2.357c0 .513.41 1.025 1.025 1.025h6.15c.615 0 1.025-.512 1.025-1.025v-2.357c1.844-1.332 3.074-3.484 3.074-5.842A7.13 7.13 0 0 0 12 1.751z',
      },
    },
  ],
};
```

### The component:

```tsx
import { Svg } from '@svjson/react';
import { lightbulb } from './lightbulb';

...
<Svg alt="arrow" src={lightbulb}/>
...
```

### Outputs:

```html
<i role="img" aria-label="arrow" aria-hidden="false">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    aria-hidden="true"
  >
    <path
      d="M12 5.097 1.299 15.798l2.515 2.515L12 10.144l8.186 8.169 2.515-2.515z"
    ></path>
  </svg>
</i>
```
