export const escapeCData = (str: string) => str.replaceAll("]]>", "\\]\\]\\>");

export const userMention = (userSnowflake: string) => escapeCData(`<@${userSnowflake}>`);
export const channelMention = (channelSnowflake: string) => escapeCData(`<#${channelSnowflake}>`);
export const messageLink = (
  guildSnowflake: string,
  channelSnowflake: string,
  messageSnowflake: string
) => escapeCData(`https://discord.com/channels/${guildSnowflake}/${channelSnowflake}/${messageSnowflake}`);
