import {
  Collection,
  ButtonStyle,
  ButtonBuilder,
  SectionBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  MessageCreateOptions,
  SeparatorSpacingSize
} from "discord.js";

import { Result } from "@util/result";
import { Message } from "@prisma/client";
import { TopicSession } from "../../context/sessions/topicSession";

export class ExchangeBuilder {
  private readonly _exchangeComps: [...NonNullable<MessageCreateOptions["components"]>];
  private readonly _topicSession: TopicSession;

  private _messages?: Collection<string, Message>;

  constructor(topicSession: TopicSession) {
    this._topicSession = topicSession;
    this._exchangeComps = [];
  }

  get components() {
    return this._exchangeComps;
  }

  get messages() {
    if (!this._messages)
      this._messages = this._topicSession.topics.flatMap(
        (t) => new Collection(
          t.databaseMsgs?.map(
            (m) => [m.messageSnowflake, m]
          )
        )
      );

    return this._messages;
  }

  userQuote(messageSnowflake: string) {
    const message = this.messages.get(messageSnowflake);
    const container = new ContainerBuilder();

    if (!message) return Result.err("Invalid Message");

    container.addSectionComponents(
      new SectionBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# <@${message.authorSnowflake}>  ${message.timestamp.toLocaleString("en-US", { timeStyle: "short", dateStyle: "short" })}`),
        new TextDisplayBuilder().setContent(message.content)
      ).setButtonAccessory(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Jump")
          .setURL(`https://discord.com/channels/${message.guildSnowflake}/${message.channelSnowflake}/${message.messageSnowflake}`)
      )
    );

    this._exchangeComps.push(container);
  }

  separator() {
    const separator = new SeparatorBuilder()
      .setDivider(false)
      .setSpacing(SeparatorSpacingSize.Large);

    this._exchangeComps.push(separator);
  }

  context(content: string) {
    const cxt = new TextDisplayBuilder().setContent(`> ${content}`);
    this._exchangeComps.push(cxt);
  }
}
