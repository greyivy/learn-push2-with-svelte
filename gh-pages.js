const ghpages = require('gh-pages')

ghpages.publish(
  'public',
  {
    branch: 'gh-pages',
    repo: 'https://github.com/greyivy/learn-push2-with-svelte.git',
    user: {
      name: 'Ivy G',
      email: 'ivymisc@posteo.net' // Update to use your email
    }
  },
  () => {
    console.log('Deploy complete!')
  }
)