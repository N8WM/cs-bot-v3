export function getGuildSettings(guildId: string) {
  const devGuildId: string = "996207303856492625";

  const settings = {
    [devGuildId]: {
      vrfEnabled: true,
      vrfRoleId: "1388043377135583262",
      vrfChannelId: "1388043283040571573",
      vrfDomainSuffix: "@calpoly.edu"
    },
  };

  return settings[guildId];
}
