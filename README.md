# Cheropatilla http server

This repo contains the implementation of the http server for the Cheropatilla website.

## Table of contents

1. [Overview of Cheropatilla](#overview-of-cheropatilla)
1. [Installation](#installation)
1. [Application overview](#application-overview)
1. [Root](#root-)
1. [Navigation bar](#navigation-bar)
1. [Explore page: "/explore"](#explore-page-explore)
1. [My profile page: "/myprofile"](#my-profile-page-myprofile)
1. [Other users' profile page: "/profile?username={username}"](#other-users-profile-page-profileusernameusername)
1. [Section page: "/{section_id}"](#section-page-section_id)
1. [Post page: "/{section_id}/{post_id}"](#post-page-section_idpost_id)
1. [Application API](#application-api)
1. [Pagination of dashboard content](#pagination-of-dashboard-content)
1. [Pagination of posts in Explore](#pagination-of-posts-in-explore)
1. [Pagination of posts in a section](#pagination-of-posts-in-a-section)
1. [Pagination of comments in a post](#pagination-of-comments-in-a-post)
1. [Pagination of activity in a profile page](#pagination-of-activity-in-a-profile-page)
1. [Follow/unfollow](#followunfollow)
1. [Update user data](#update-user-data)
1. [Reply a post](#reply-a-post)
1. [Notifications](#notifications)
1. [Project status and motivation](#project-status-and-motivation)

## Overview of ***Cheropatilla***

**Cheropatilla** is a forum-like platform that introduces a pagination system based on randomness.

It's features are pretty similar to a regular discussion forum; users can create *posts* in a *section* and other users can leave *replies* on that post or on other replies of the post. So there are three levels of contents: post->comments->subcomments.

Users can also have followers and follow other users so that they can see the recent activity of the users they follow in their homepage (their posts, comments and subcomments).

Nothing new so far.

The feature that differentiates it from the rest is the way it makes **pagination**. Most websites use one of the following techniques:

* **Infinite scrolling 1**; showing contents sequentially in cronological order and requesting more contents on scroll. An example: **Twitter**. ![infinite scrolling by twitter](img/twitter_infinite_scrolling.gif)
* **Infinide scrolling 2**; showing contents sequentially, using an algorithm as complex as necessary to define the order in which they appear in the screen. For example: **Facebook**.
* **Usual pagination 1**; distributing the content in *pages* and showing a navigation bar at the top or the bottom of the screen. In each page it shows contents sequentially in cronological order, e.g. any blog made in **WordPress**.
* **Usual pagination 2**; showing the same navigation bar in the pages but the contents are placed by order of relevance defined by a complex algorithm. For example: **Google search**. ![google pagination](img/google_pagination.PNG)

In **Cheropatilla**, all the pagination is handled by the ***Recycle*** button. The idea is that when you press the button, a new feed of contents is loaded in a **random fashion**. In order to keep some consistency on the content *quality* across recycles, contents are classified as **new**, **popular** or **top** depending upon their activity; the client must provide a pattern of content quality that the server must fulfill whenever possible. For example:

![pattern](img/pattern.png)

The order in which the contents are arranged by their status (i.e. *new*, *popular* or *top*) is called ***the pattern***; this is simply a list of content status, specifying the order in which the contents should be returned.

The way in which the contents are returned to make up a feed is completely random; the user enters the page of a section and the server fills the pattern in a random fashion with ***active*** contents from the section. To be exact, this is the algorithm summarized in three steps:

1. Load all the *active* contents from the database into an array.
1. Classify the contents in three categories: *new*, *popular* and *top*.
1. Follow the pattern; on each iteration *i*, take out a content from the category indicated by the pattern (new, popular or top) in a random fashion and insert it into the resulting array.

On the other hand, as the selection of contents must be random for each *feed*, it must be a way to record the contents that the user has already seen and discard them from the set of active contents, in order to have a real pagination in the following feed requests.

The most easy solution is to use cookies. Each time the server sends a *feed* to the client, the session gets updated adding the IDs of the contents that were sent. Each time the client requests a new feed, the server gets the IDs of the contents that were already seen by the user.

Therefore, another step is placed in between the **step 1** and **step 2** from the previous algorithm: the discarding of contents already seen by the user.

The way feeds are requested is through the button ***Recycle***. The contents (and the order) that are obtained by recicling the page is actually unpredictable, but three things can be guaranteed:

1. The top content will **always** be the most popular of all the **active** contents. At the first recycle, the spot of the top content will be taken by the second most popular; at the second recycle, by the third most oustanding and so on in each recycle.
1. The contents received by the client between recycles will **never** be repeated.
1. The server will follow the pattern as much as possible, but in the case in which there are less popular contents than the required by the pattern, their places will be taken by contents classified as new and viceversa.

As I mentioned earlier, the contents are taken from the database only if they're **active**.

There are two contents status: active and archived. Users cannot perform interactions on contents in archived state, and they will not be shown on section feeds.

Once a day, all the contents from all the sections will be analized by an algorithm, which determines whether they are active enough and are still popular at the time. The unactive ones are moved to a place in the database as archived. This process is called ***Quality assurance***.

A piece of content will stay active if it has interactions constantly, and that way it's status changes from new to popular. Are considered as interactions the following events: upvote on post, comment on post, upvote on comment, comment on a comment and upvote on a subcomment.

That's how posts are listed in a section, but other types of contents, such as comments in a post and activities from a user follow the same idea of doing all the pagination of contents through a single button of **recycle**.

Now let's take a look at the levels of contents: post->comment->subcomment.

The idea is that a subcomment is inside of a comment, which in turn is inside of a post (which belongs to a section).

In the view of the post page, the grid of comments begins at the end of the post content and like the contents in a section, they are ordered in a random fashion, following a given pattern, and again, more comments are gotten with the *recycle* button.

The flow is quite different when we're viewing the subcomments of any comment; this is the only content shown sequentially (one below each other) and by chronological order.

There are only two more views: the dashboard and the user profile.

- The dashboard is divided by three sections: recent activity of users followed, own activity and saved posts. All with their own *pattern* and their *recycle* button. Are considered activity posts published, comments and subcomments.
- The user profile lists the recent activity of the user. Again, with its own *pattern* and *recycle* button.

This model of content listing in a random fashion (with the exception of the subcomments), is designed for every post to have the same probabilities to be viewed by all the users, so that ***content discovery*** becomes easier.

## Installation

1. run `go get github.com/luisguve/cherosite` and `go get github.com/luisguve/cheroapi`. Then run `go install github.com/luisguve/cherosite/cmd/cherosite` and `go install github.com/luisguve/cheroapi/cmd/...`. The following binaries will be installed in your $GOBIN: `cherosite`, `userapi`, `general` and `contents`. On setup, all of these must be running.
1. You will need to write a .toml file in order to configure the site to get it working. See cherosite.toml at the project root for an example.
1. Follow the installation instructions for the gRPC services in the [cheroapi project](https://github.com/luisguve/cheroapi#Installation).

To run the web application, run `cherosite`, `userapi`, `general` and `contents`, then visit **localhost:8000** from your browser, create a couple users and start following users, creating posts, replying posts and saving/unsaving them.

## Application overview

### Root: "/"

**If you're not logged in**, the login/signin page is rendered. You can create an account with an email, name, patillavatar, username, alias (if blank, name is used as alias), description and password. Email and username must be unique; username is alphanumeric and underscores are allowed.

*Note:* patillavatar (profile pic) is optional; if you don't send a picture, it picks a random one from the default pics specified in the field patillavatars in the toml file.

![login/signin](img/login.png)

**When you're logged in**, the dashboard page is rendered. Here you can see the recent activity of the users you're following, your own recent activity and the posts you've saved. All of these contents are loaded in a **random fashion**.

![dashboard](img/empty_dashboard.png)

### Navigation bar

![navigation bar](img/navbar.png)

A couple of buttons are displayed in this area:

1. A link to the root, where the website logo is supposed to be.

![logo](img/navbar_logo.png)

2. A ***Recycle*** button. This button is the **main feature** of the whole website. The idea is that when you press it, it loads more contents in a **random fashion**, depending upon the select input aside it, and builds ***local pages*** from these contents. The navigation across these local pages will be done through **PREV** and **NEXT** buttons.

![recycle](img/navbar_recycle.png)

3. A link to */explore*.

![expore](img/navbar_explore.png)

4. Your notifications, a link to your profile page and a button to logout.

![user data](img/navbar_user.png)

### Explore page: "/explore"

This page displays posts from every section registered in the `sections` array in the .toml file in a random fashion.

![explore](img/explore.png)

### My profile page: "/myprofile"

In this page, you can view and update your basic information.

![myprofile](img/myprofile.png)

### Other users' profile page: "/profile?username={username}"

In this page, you can view the basic information of othe user, along with the recent activity for that user.

![user profile](img/user_profile.png)

### Section page: "/{section_id}"

This page displays posts from a given section and a form to create a post on that section. The section id must match the id of one of the sections specified in the `sections` array in the .toml file.

![section](img/section.png)

### Post page: "/{section_id}/{post_id}"

This page displays the content of a given post and the comments associated to that post, at the bottom. Note that the comments are also loaded in a **random fashion**.

You can also reply other comments, but these subcomments will be loaded sequentially in chronological order.

![post](img/post.png)

![comments](img/post_comments.png)

## Application API

Note: all the endpoints for pagination will return contents in html format.

### Pagination of dashboard content

To get more contents from the recent activity of the users following, the endpoint **"/recyclefeed"** receives GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"**.

To get more contents from the recent activity of the user logged in, the endpoint **"/recycleactivty"** receives GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"**.

To get more saved posts of the user logged in, the endpoint **"/recyclesaved"** receives GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"**.

### Pagination of posts in Explore

To get more contents from every section, the endpoint **"/explore/recycle"** receives GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"**.

### Pagination of posts in a section

To get more contents from a given section, the endpoint **"/{section_id}/recycle"** receives GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"**.

### Pagination of comments in a post

To get more comments from a given post, the endpoint **"/{section_id}/{post_id}/recycle"** receives GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"**.

### Pagination of activity in a profile page

To get more posts, comments and subcomments from a given user, the endpoint **"/profile/recycle?userid={user_id}"** receives GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"**.

Note that it requires the user id rather than the username.

### Follow/unfollow

To follow a user, the endpoint **"/follow?username={username}"** receives POST requests. Similarly, the endpoint **"/unfollow?username={username}"** receives POST requests to unfollow a user.

A user cannot follow/unfollow itself.

### Update user data

For this purpose, the endpoint **"/myprofile/update"** receives POST requests with the following form data:

- alias: text
- username: text
- description: text
- pic_url: file - jpg, png or gif

### Reply a post

The endpoint **"/{section_id}/{post_id}/comment"** will receive POST requests with the following form data:

- content: string
- ft_file: file - jpg, png or gif

Similarly, to reply a comment, the endpont **"/{section_id}/{post_id}/comment?c_id={comment id}"** will receive POST requests with the same form data.

### Notifications

- Notifications are sent to users as events happens through a **websocket** on **"/livenotifs"**.
- Notifications are cleaned up through GET requests with **Header "X-Requested-With" set to "XMLHttpRequest"** to:
 - **"/readnotifs"** to mark all the unread notifications as read.
 - **"/clearnotifs"** to delete both read and unread notifications.

The following events will be notified:

- A user (not you) upvotes your post. Only you will be notified.
- A user (not you) upvotes your comment. The post author and you will be notified.
- A user (not you) upvotes your subcomment. The post author and you will be notified.
- A user (not you) leaves a reply on your post. Only you will be notified.
- A user (not you) leaves a reply on your comment. The post author, the comment author and all the users who replied the same comment will be notified.

## Project status and motivation

As you can see, the frontend needs a lot of work, but web design is definitely not my primary skill. Pull requests and suggestions are welcome. If you like the idea of random pagination and you're looking to collaborate with the frontend, here's what you need to know:

- HTML pages are rendered from [Go templates](https://godoc.org/text/template) in the folder web/templates.

- JavaScript files are located in the folder web/static/js and referenced as `/static/js/[filename].js` in templates.

- CSS files are located in the folder web/static/css and referenced as `/static/css/[filename].css` in templates.

- You need to set the absolute path of the folder web/static to the variable `static_dir` in the .toml config file.

- You need to set the absolute path of the folder web/internal/templates to the variable `internal_tpl_dir` in the .toml config file.

- You need to set the absolute path of the folder web/templates to the variable `public_tpl_dir` in the .toml config file.

I made this project primarily to improve my skills on web development, but I also wanted to build a funny, unique and non-trivial web application for posting and discovering content.

In my opinion, the idea of random pagination has **limitless possibilities** and can fit easily anywhere. I don't think it should completely replace the usual techniques of pagination aforementioned; all of them have pros and cons and this one is no exception. However, if I had to say what's the best use case for random pagination, I would say that one where order of content doesn't matter **and** the same order complicates the discover of contents by users.
