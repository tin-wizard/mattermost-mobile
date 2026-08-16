// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import CallsNative from '@mattermost/calls-native';
import {defineMessages} from 'react-intl';
import {Platform} from 'react-native';

// Localized strings for the Android foreground-service notification. iOS
// doesn't use a foreground service; AVAudioSession + the `audio`
// background mode keep the mic alive on its own.
const messages = defineMessages({
    channelName: {
        id: 'mobile.calls.foreground_service.channel_name',
        defaultMessage: 'Mattermost Calls',
    },
    channelDescription: {
        id: 'mobile.calls.foreground_service.channel_description',
        defaultMessage: 'Keeps the microphone active while a call is in progress',
    },
    title: {
        id: 'mobile.calls.foreground_service.title',
        defaultMessage: 'Mattermost',
    },
    text: {
        id: 'mobile.calls.foreground_service.text',
        defaultMessage: 'Call in progress',
    },
});

const channelConfig = {
    id: 'calls_channel',
    name: 'TIN',
    description: 'TIN Calls microphone while app is in the background',
    enableVibration: false,
};

// Note: multiple calls with same arguments are a noop.
export const foregroundServiceSetup = () => {
    VIForegroundService.getInstance().createNotificationChannel(channelConfig);
};

export const foregroundServiceStart = async () => {
    const notificationConfig = {
        channelId: 'calls_channel',
        id: 345678,
        title: 'TIN',
        text: 'TIN Calls Microphone',
        icon: '',
        button: 'Stop',
    };
    try {
        await VIForegroundService.getInstance().startService(notificationConfig);
    } catch (e) {
        logError('Calls: Cannot start ForegroundService, error:', e);

    }
    CallsNative.foregroundServiceStart({
        channelId: 'calls_channel',
        channelName: intl.formatMessage(messages.channelName),
        channelDescription: intl.formatMessage(messages.channelDescription),
        title: intl.formatMessage(messages.title),
        text: intl.formatMessage(messages.text),
    });
};

export const foregroundServiceStop = () => {
    if (Platform.OS !== 'android') {
        return;
    }
    CallsNative.foregroundServiceStop();
};
