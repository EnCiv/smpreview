# **Social Media Preview**

Works with EnCiv/undebate to create social media preview images after a new candidate recording has been posted.

## Running on Heroku

There are a few extra steps required to run on Heroku. See the
[Puppeteer Heroku documentation](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-heroku)
for additional information on using Puppeteer on Heroku. These instructions assume
you already have the Heroku CLI installed and configured.

1. Create a new app on Heroku: `heroku create APPNAMEHERE`
2. Add the Puppeteer Heroku buildpack: `heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack`
3. Add the following Config Vars to your Heroku server, where `HOSTNAME` refers to the URI of your Undebate server
   1. `HOSTNAME`
   2. `MONGODB_URI`
   3. `CLOUDINARY_URL`
4. Deploy to Heroku: `git push heroku master`
