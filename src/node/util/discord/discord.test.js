const { Discord } = require('./discord.js');

/**
 * Mock client to replicate the Discord client for testing purposes
 */
class MockClient {
  /** Mock channel */
  channel = {
    send: this.send
  };

  /** Mock guild */
  guild = {
    channels: {
      create: this.create
    },
    id: 'mock-id'
  };

  /** Mock guilds.cache */
  guilds = {
    cache: this.createMockGuildCache()
  };

  /** Mock login tracker */
  loggedOn = false;

  /** Map of mock callbacks */
  mockCallbacks = new Map();

  /** Mock user.tag */
  user = {
    tag: 'MockClient'
  };

  /**
   * Mock implementation of channels.create. If name contains success, Promise
   * will resolve, otherwise reject.
   * 
   * @param {string} name Name of the channel to create
   * @returns {Promise<string>} Promise which will resolve to the mock channel or reject
   */
  create(name, _) {
    return new Promise((resolve, reject) => {
      if (name.includes('success')) {
        resolve('success');
      }
      else {
        reject('failed');
      }
    });
  }

  /**
   * Helper function to create the mock guild map
   * 
   * @returns {Map<string, any>} A map to utilize for mocking the guild map
   */
  createMockGuildCache() {
    const map = new Map();
    const guild = {
      channels: {
        cache: [{
          name: 'mock-channel'
        }]
      }
    };

    map.set('mock-guild-id', guild);
    return map;
  }

  /**
   * Mock implementation of Discord client 'login' method
   * 
   * @param {string} token 
   */
  login(token) {
    this.loggedOn = token !== undefined;
  }

  /**
   * Mock implementation of Discord client 'on' method
   * 
   * @param {string} event 
   * @param {function} callback 
   */
  on(event, callback) {
    this.mockCallbacks.set(event, callback);
  }

  /**
   * Mock implementation of Discord channel 'send' method
   * 
   * @param {string} message Mock message to 'send'
   * @returns {Promise<string>} A promise which will resolve or reject to a string
   */
  send(message) {
    return new Promise((resolve, reject) => {
      if ((typeof message === 'string' && message.includes('success')) || typeof message !== 'string') {
        resolve({ guild: { id: 'mock-id' }, msg: 'success' });
      }
      else {
        reject('failed');
      }
    });
  }
}

describe('Discord test suite', () => {
  process.env.LOG_LEVEL = 'TESTING';

  test('test Discord client', () => {
    const discord = new Discord();
    expect(discord._client).toBeDefined();
  });

  test('test Discord token', () => {
    const mockClient = new MockClient();
    const discord = new Discord('some-token', '', mockClient);

    expect(discord._client.mockCallbacks.get('ready')).toBeDefined();
    expect(discord._client.mockCallbacks.get('messageCreate')).toBeDefined();
    expect(discord._client.loggedOn).toEqual(true);
  });

  test('test Discord no token', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);

    expect(discord._client.mockCallbacks.get('ready')).toBeUndefined();
    expect(discord._client.mockCallbacks.get('messageCreate')).toBeUndefined();
    expect(discord._client.loggedOn).toEqual(false);
  });

  test('test createChannel successful', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);

    discord.createChannel(mockClient.guild, 'create-channel-success').then((result) => {
      expect(result).toEqual('success');
    });
  });

  test('test createChannel unsuccessful', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);

    discord.createChannel(mockClient.guild, 'create-channel-failed').then(() => { }).catch((err) => {
      expect(err).toEqual('failed');
    });
  });

  test('test sendMessage successful', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);

    discord.sendMessage(mockClient.channel, 'message-success').then((result) => {
      expect(result.guild.id).toEqual('mock-id');
      expect(result.msg).toEqual('success');
    });
  });

  test('test sendMessage unsuccessful', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);

    discord.sendMessage(mockClient, 'message-failed').then(() => { }).catch((err) => {
      expect(err).toEqual('failed');
    });
  });

  test('test createEmbedMessage', () => {
    const discord = new Discord();
    const msg = discord.createEmbedMessage('title', '#000000', 'desc', []);
    expect(msg).toBeDefined();
  });

  test('test _messageCreate bot', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._messageCreate({ author: { bot: true } });
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });

  test('test _messageCreate no pt!', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._messageCreate({ content: 'asdf', author: { bot: false } });
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });

  test('test _messageCreate empty command', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._messageCreate({
        content: 'pt!',
        author: { bot: false },
        channel: mockClient.channel
      });
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });

  test('test _messageCreate help command', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._messageCreate({
        content: 'pt!help',
        author: { bot: false },
        channel: mockClient.channel
      });
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });

  test('test _messageCreate help command error', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._messageCreate({
        content: 'pt!help',
        author: { bot: false }
      });
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });

  test('test _messageCreate rating command', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._messageCreate({
        content: 'pt!rating ticker',
        author: { bot: false },
        channel: mockClient.channel
      });
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });

  test('test _messageCreate unknown command', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._messageCreate({
        content: 'pt!unknown',
        author: { bot: false },
        channel: mockClient.channel
      });
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });

  test('test _onReady', () => {
    const mockClient = new MockClient();
    const discord = new Discord(undefined, '', mockClient);
    let success = true;

    try {
      discord._onReady();
    }
    catch (ex) {
      success = ex;
    }

    expect(success).toEqual(true);
  });
});