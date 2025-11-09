#!/usr/bin/env node

/**
 * LinkedIn Agent Example Usage
 *
 * This file demonstrates how to use the LinkedIn agent programmatically.
 * Copy this file and customize it for your needs.
 */

const LinkedInAgent = require('./linkedin-agent');

// Initialize the agent
const agent = new LinkedInAgent();

/**
 * Example 1: Post a simple text update
 */
async function postSimpleUpdate() {
  console.log('Example 1: Posting a simple text update...');
  try {
    await agent.postTextUpdate(
      'Hello LinkedIn! This is an automated post from my LinkedIn agent. 🚀',
      'PUBLIC'
    );
  } catch (error) {
    console.error('Failed to post update:', error.message);
  }
}

/**
 * Example 2: Post an article with commentary
 */
async function postArticleExample() {
  console.log('\nExample 2: Posting an article...');
  try {
    await agent.postArticle(
      'Just found this amazing article about automation! Must read for developers.',
      'https://example.com/automation-guide',
      'The Complete Guide to Automation',
      'Learn how to automate your daily tasks and boost productivity.',
      'PUBLIC'
    );
  } catch (error) {
    console.error('Failed to post article:', error.message);
  }
}

/**
 * Example 3: Post an image
 */
async function postImageExample() {
  console.log('\nExample 3: Posting an image...');
  try {
    // Make sure to have an image file at this path
    await agent.postImage(
      'Check out this awesome visualization! 📊',
      './path/to/your/image.jpg',
      'PUBLIC'
    );
  } catch (error) {
    console.error('Failed to post image:', error.message);
  }
}

/**
 * Example 4: Schedule a post for later
 */
function schedulePostExample() {
  console.log('\nExample 4: Scheduling a post...');

  // Schedule a post for 1 hour from now
  const scheduledTime = new Date();
  scheduledTime.setHours(scheduledTime.getHours() + 1);

  const postConfig = {
    type: 'text',
    text: 'This is a scheduled post! Posted automatically at the right time. ⏰',
    visibility: 'PUBLIC'
  };

  agent.schedulePost(postConfig, scheduledTime);

  console.log(`Post scheduled for: ${scheduledTime.toLocaleString()}`);
  console.log('Keep this process running for the scheduled post to execute.');
}

/**
 * Example 5: Batch posting with delays
 */
async function batchPostingExample() {
  console.log('\nExample 5: Batch posting with delays...');

  const posts = [
    'Day 1: Introducing my new project! 🎉',
    'Day 2: Here are the key features... 💡',
    'Day 3: Learn how to get started... 📚',
  ];

  for (let i = 0; i < posts.length; i++) {
    try {
      console.log(`Posting update ${i + 1}/${posts.length}...`);
      await agent.postTextUpdate(posts[i], 'PUBLIC');

      // Wait 10 seconds between posts (adjust as needed)
      if (i < posts.length - 1) {
        console.log('Waiting 10 seconds before next post...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    } catch (error) {
      console.error(`Failed to post update ${i + 1}:`, error.message);
    }
  }

  console.log('Batch posting complete!');
}

/**
 * Example 6: Get your profile information
 */
async function getProfileExample() {
  console.log('\nExample 6: Getting profile information...');
  try {
    const profile = await agent.getUserProfile();
    console.log('Profile retrieved successfully!');
    console.log('Profile data:', JSON.stringify(profile, null, 2));
  } catch (error) {
    console.error('Failed to get profile:', error.message);
  }
}

/**
 * Example 7: Scheduled campaign
 */
function scheduledCampaignExample() {
  console.log('\nExample 7: Creating a scheduled campaign...');

  const now = new Date();

  const campaign = [
    {
      text: '🎯 Day 1: Setting goals for this week!',
      delay: 0 // Post immediately
    },
    {
      text: '💪 Day 2: Making progress on those goals!',
      delay: 24 // Post after 24 hours
    },
    {
      text: '🚀 Day 3: Halfway there, keep going!',
      delay: 48 // Post after 48 hours
    },
    {
      text: '✅ Day 4: Goals achieved! What a week!',
      delay: 72 // Post after 72 hours
    }
  ];

  campaign.forEach(post => {
    const scheduledTime = new Date(now.getTime() + post.delay * 60 * 60 * 1000);

    agent.schedulePost({
      type: 'text',
      text: post.text,
      visibility: 'PUBLIC'
    }, scheduledTime);

    console.log(`Scheduled: "${post.text.substring(0, 30)}..." for ${scheduledTime.toLocaleString()}`);
  });

  console.log('\nCampaign scheduled! Keep this process running.');
  console.log('Press Ctrl+C to stop.');

  // Keep the process alive
  setInterval(() => {}, 1000);
}

/**
 * Main function - Run the examples
 */
async function main() {
  console.log('=== LinkedIn Agent Examples ===\n');
  console.log('Uncomment the examples you want to run.\n');

  // Uncomment the examples you want to run:

  // await postSimpleUpdate();
  // await postArticleExample();
  // await postImageExample();
  // schedulePostExample();
  // await batchPostingExample();
  // await getProfileExample();
  // scheduledCampaignExample();

  console.log('\n=== Examples Complete ===');
  console.log('Edit this file to uncomment and run different examples.');
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('Error running examples:', error);
    process.exit(1);
  });
}

module.exports = {
  postSimpleUpdate,
  postArticleExample,
  postImageExample,
  schedulePostExample,
  batchPostingExample,
  getProfileExample,
  scheduledCampaignExample
};
