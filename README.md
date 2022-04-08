# SVJ - CLI to optmize and convert SVGs to a JSON resource

## Motivations

Importing SVGs as images has a runtime cost, inline unused SVGs has bundle size cost and using a loader to create SVG components, has both bundle size and build time costs.

In order to manipulate SVG assets without a loader, keeping the gains of tree shaking algorithms, and using a familiar simple syntax, I'd decided to use JSON.

I'd found a lib that converts [SVG to JSON](https://github.com/elrumordelaluz/svgson), but, for support reasons, theirs parsing result was too verbose for my needs. Also the SVG wasn't being optimized, so in addition to simplifying the JSON output, I'd added [SVGO](https://github.com/svg/svgo) as an option to create a smaller result.

## Options:

<table>
  <tr><td>-v, --version</td><td>current version</td></tr>
  <tr><td>-r, --recommended</td><td>use recommended options</td></tr>
  <tr><td>-i, --input [input]</td><td>input file</td></tr>
  <tr><td>-d, --dist [dist]</td><td>dist file</td></tr>
  <tr><td>--svgo</td><td>use svgo optmizer</td></tr>
  <tr><td>--esm</td><td>use ECMAScript Modules</td></tr>
  <tr><td>--ts</td><td>use TypeScript</td></tr>
  <tr><td>-h, --help</td><td>display help for command</td></tr>
</table>

## Example:

### Input SVG file

```html
<!-- lightbulb.svg -->
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:cc="http://creativecommons.org/ns#"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:svg="http://www.w3.org/2000/svg"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
  xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  height="24px"
  viewBox="0 0 24 24"
  width="24px"
  fill="currentColor"
  version="1.1"
  id="svg4"
  sodipodi:docname="lightbulb.svg"
  inkscape:version="1.0.2 (394de47547, 2021-03-26)"
>
  <metadata id="metadata10">
    <rdf:RDF>
      <cc:Work rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <defs id="defs8" />
  <sodipodi:namedview
    pagecolor="#ffffff"
    bordercolor="#666666"
    borderopacity="1"
    objecttolerance="10"
    gridtolerance="10"
    guidetolerance="10"
    inkscape:pageopacity="0"
    inkscape:pageshadow="2"
    inkscape:window-width="1920"
    inkscape:window-height="1019"
    id="namedview6"
    showgrid="false"
    inkscape:zoom="15.3125"
    inkscape:cx="-2.9892135"
    inkscape:cy="15.736825"
    inkscape:window-x="0"
    inkscape:window-y="25"
    inkscape:window-maximized="1"
    inkscape:current-layer="svg4"
  />
  <path
    id="path873"
    style="stroke-width:1.56909"
    d="m 8.9253156,21.224052 c 0,0.512444 0.4099595,1.024893 1.0248945,1.024893 h 4.0995779 c 0.614937,0 1.024895,-0.512449 1.024895,-1.024893 V 20.199155 H 8.9253156 Z M 12,1.7510548 c -3.9970888,0 -7.1742615,3.1771731 -7.1742615,7.1742618 0,2.4597474 1.2298733,4.6120254 3.0746835,5.8419004 v 2.357255 c 0,0.512447 0.4099579,1.024895 1.0248938,1.024895 h 6.1493672 c 0.614937,0 1.024894,-0.512448 1.024894,-1.024895 v -2.357255 c 1.844812,-1.332365 3.074685,-3.484642 3.074685,-5.8419004 0,-3.9970887 -3.177173,-7.1742618 -7.174262,-7.1742618 z"
  />
</svg>
```

### Output JSON file

```js
export const lightbulb = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  paths: [
    {
      strokeWidth: '1.569',
      d: 'M8.925 21.224c0 .512.41 1.025 1.025 1.025h4.1c.615 0 1.025-.513 1.025-1.025V20.2h-6.15zM12 1.751a7.13 7.13 0 0 0-7.174 7.174c0 2.46 1.23 4.612 3.074 5.842v2.357c0 .513.41 1.025 1.025 1.025h6.15c.615 0 1.025-.512 1.025-1.025v-2.357c1.844-1.332 3.074-3.484 3.074-5.842A7.13 7.13 0 0 0 12 1.751z',
    },
  ],
};
```
