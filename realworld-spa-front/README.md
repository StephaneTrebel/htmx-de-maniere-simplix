
# [Next.js 14]

> ### Next.js 14 codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

### [Demo](https://next-realworld.now.sh/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


## Getting started

You can view a live demo over at [https://realworld-tau.vercel.app/](https://realworld-tau.vercel.app/)

To get the frontend running locally:

- Clone this repo
- `npm install` to install all dependencies
- `npm run dev` to start the local server

- add .env file at root directory
- Then add the following variable

  - COOKIE_NAME=%name of cookie%
  - COOKIE_PASSWORD=%password you want for cookie%
  - ++note COOKIE_PASSWORD length must be at least 32 character as it is described here 
https://www.npmjs.com/package/iron-session
 - you can change base url in respect of your backend application
  - BASE_URL=https://api.realworld.io/api

  your frontend application url NEXT_PUBLIC_RELATIVE_PATH example if your running on localhost
  - NEXT_PUBLIC_RELATIVE_PATH=http://localhost:3000/api



## Functionality overview

The example application is a social blogging site (i.e. a Medium.com clone) called "Conduit". It uses a custom API for all requests, including authentication. You can view a live demo over at [https://realworld-tau.vercel.app/](https://realworld-tau.vercel.app/)

**General functionality:**

- Authenticate users via JWT (login/register pages + logout button on settings page)
- CRU\* users (sign up & settings page - no deleting required)
- CRUD Articles
- CR\*D Comments on articles (no updating required)
- GET and display paginated lists of articles
- Favorite articles
- Follow other users

**The general page breakdown looks like this:**

- Home page (URL: /)
  - List of tags
  - List of articles pulled from either Feed, Global, or by Tag
  - Pagination for list of articles
- Sign in/Sign up pages (URL: /user/login, /user/register)
  - Use JWT (store the token in localStorage)
- Settings page (URL: /user/settings )
- Editor page to create/edit articles (URL: /editor/new, /editor/article-slug-here)
- Article page (URL: /article/article-slug-here)
  - Delete article button (only shown to article's author)
  - Render markdown from server client side
  - Comments section at bottom of page
  - Delete comment button (only shown to comment's author)
- Profile page (URL: /profile/username-here, /profile/username-here?favorite=true)
  - Show basic user info
  - List of articles populated from author's created articles or author's favorited articles

<br />

[![Brought to you by Thinkster](https://raw.githubusercontent.com/gothinkster/realworld/master/media/end.png)](https://thinkster.io)

