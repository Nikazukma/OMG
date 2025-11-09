jekyll-gulp-sass-browser-sync + LinkedIn Agent
=============================

A starter project including full setup for Jekyll, GulpJS, SASS, AutoPrefixer &amp; BrowserSync, plus an automated LinkedIn posting agent

Here's a 1.5min [screencast](http://quick.as/pvrslgx) showing what you get.

And here's a GIF showing the CSS injecting.

![GIF](http://f.cl.ly/items/373y2E0e0i2p0E2O131g/test-gif.gif)

## System Preparation

To use this starter project, you'll need the following things installed on your machine.

1. [Jekyll](http://jekyllrb.com/) - `$ gem install jekyll`
2. [NodeJS](http://nodejs.org) - use the installer.
3. [GulpJS](https://github.com/gulpjs/gulp) - `$ npm install -g gulp` (mac users may need sudo)

## Local Installation

1. Clone this repo, or download it into a directory of your choice.
2. Inside the directory, run `npm install`.

## Usage

**development mode**

This will give you file watching, browser synchronisation, auto-rebuild, CSS injecting etc etc.

```shell
$ gulp
```

**jekyll**

As this is just a Jekyll project, you can use any of the commands listed in their [docs](http://jekyllrb.com/docs/usage/)

## LinkedIn Posting Agent

This project includes an automated LinkedIn posting agent that allows you to post updates, articles, and images to LinkedIn.

### Quick Start

1. Set up your LinkedIn API credentials:
```shell
cp .env.example .env
# Edit .env with your LinkedIn credentials
```

2. Install dependencies:
```shell
npm install
```

3. Post to LinkedIn:
```shell
# Post a text update
npm run linkedin:post -- --text "Hello LinkedIn!"

# For full documentation, see LINKEDIN-AGENT-README.md
```

For complete documentation on the LinkedIn agent, including how to get API credentials, post articles, images, and schedule posts, see [LINKEDIN-AGENT-README.md](LINKEDIN-AGENT-README.md).

## Deploy with Gulp

You can easily deploy your site build to a gh-pages branch. First, follow the instructions at [gulp-gh-pages](https://github.com/rowoot/gulp-gh-pages) to get your branch prepared for the deployment and to install the module. Then, in `gulpfile.js` you'll want to include something like the code below. `gulp.src()` needs to be the path to your final site folder, which by default will be `_site`. If you change the `destination` in your `_config.yml` file, be sure to reflect that in your gulpfile.



```javascript
var deploy = require("gulp-gh-pages");

gulp.task("deploy", ["jekyll-build"], function () {
    return gulp.src("./_site/**/*")
        .pipe(deploy());
});
```
