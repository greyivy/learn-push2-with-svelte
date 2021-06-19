# Learn Push 2 with Svelte (and WebMIDI)

**🌸 Currently very early in development! Feel free to contribute <3 🌸**

Learn chords, scales, and music theory on the Push 2, right inside your web browser! This started as a project to test out Svelte but it turns out it's really useful 🤷‍♀️

## Demo

**[View in any Chromium-based browser](https://greyivy.github.io/learn-push2-with-svelte)**

https://user-images.githubusercontent.com/5335625/122630992-7b3b2b80-d0b7-11eb-9c0d-1e01e7e6c60c.mp4

## Features
- Experimental Push 2 display driver with WebUSB and Pyodide (via WebASM)
- Highlights chords and scales onscreen and on your controller display and pads
- Overlays useful music theory information on top of your pads
- Mirrors the physical controller onscreen in real time
- Shows a traditional keyboard mapped to your controller's pads
- Predicts the chord you're currently playing
- Helps you practice chord progressions (think Guitar Hero)
- A few sounds and a TON of chords, chord progressions, and scales to try out
- Easy to add other controllers (e.g. Launchpad), layout generators, and sounds because TypeScript is awesome!
- Super performant thanks in part to to [Svelte's stores implementation](https://svelte.dev/tutorial/writable-stores) and its easy nesting

Thanks to [@stordahl](https://github.com/stordahl) for introducing me to Svelte!

## Roadmap
- UI improvements

### Future ideas/improvements
- Song bank
- Drumming practice
- Fix chord equality (e.g. when advancing the chord bank)
- Rewrite display driver in Rust (or another language) w/ WebASM
- Configure a code formatter
- Real-time remote jam sessions through WebRTC!?
- ???
- No profit (donate to mutual aid or a trans organization near you instead!)

---

This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
```

*Note that you will need to have [Node.js](https://nodejs.org) installed.*


## Get started

Install the dependencies...

```bash
cd svelte-app
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).


## Single-page app mode

By default, sirv will only respond to requests that match files in `public`. This is to maximise compatibility with static fileservers, allowing you to deploy your app anywhere.

If you're building a single-page app (SPA) with multiple routes, sirv needs to be able to respond to requests for *any* path. You can make it so by editing the `"start"` command in package.json:

```js
"start": "sirv public --single"
```

## Using TypeScript

This template comes with a script to set up a TypeScript development environment, you can run it immediately after cloning the template with:

```bash
node scripts/setupTypeScript.js
```

Or remove the script via:

```bash
rm scripts/setupTypeScript.js
```

## Deploying to the web

### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name my-project
```

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public my-project.surge.sh
```
