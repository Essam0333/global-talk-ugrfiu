
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="bubble.left.and.bubble.right.fill" />
        <Label>Chats</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="contacts" name="contacts">
        <Icon sf="person.2.fill" />
        <Label>Contacts</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
