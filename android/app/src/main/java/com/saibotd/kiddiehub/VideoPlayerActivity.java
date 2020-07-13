package com.saibotd.kiddiehub;


import android.app.Activity;
import android.content.Intent;
import android.media.session.PlaybackState;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.ExoPlaybackException;
import com.google.android.exoplayer2.ExoPlayer;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.PlaybackPreparer;
import com.google.android.exoplayer2.Player;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.audio.AudioAttributes;
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.ProgressiveMediaSource;
import com.google.android.exoplayer2.ui.PlayerControlView;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.upstream.DataSpec;
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory;
import com.google.android.exoplayer2.upstream.FileDataSource;
import com.google.android.exoplayer2.util.Util;


public class VideoPlayerActivity extends AppCompatActivity
        implements OnClickListener, PlaybackPreparer, PlayerControlView.VisibilityListener {
    private static final String TAG = "VideoPlayer";
    private PlayerView playerView;
    private SimpleExoPlayer player;
    private long lastPlaybackPosition;
    private int currentWindow;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        Intent intent = getIntent();
        super.onCreate(savedInstanceState);

        setContentView(R.layout.video_player_activity);

        playerView = findViewById(R.id.player_view);
        playerView.setControllerVisibilityListener(this);
        playerView.requestFocus();
        initializePlayer(true);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (Util.SDK_INT > 23) {
            initializePlayer(false);
            if (playerView != null) {
                playerView.onResume();
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (Util.SDK_INT <= 23 || player == null) {
            initializePlayer(false);
            if (playerView != null) {
                playerView.onResume();
            }
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (Util.SDK_INT <= 23) {
            if (playerView != null) {
                playerView.onPause();
            }
        }
        releasePlayer();
    }

    @Override
    public void onStop() {
        super.onStop();
        if (Util.SDK_INT > 23) {
            if (playerView != null) {
                playerView.onPause();
            }
        }
        releasePlayer();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }


    // Activity input

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // See whether the player view wants to handle media or DPAD keys events.
        return playerView.dispatchKeyEvent(event) || super.dispatchKeyEvent(event);
    }


    // Internal methods

    private void releasePlayer() {
        if (player != null) {
            player.stop();
            lastPlaybackPosition = player.getCurrentPosition();
            currentWindow = player.getCurrentWindowIndex();
            playerView.setPlayer(null);
            player.release();
            player = null;
        }
    }

    private void initializePlayer(boolean playWhenReady) {
        Intent intent = getIntent();
        String fileUri = intent.getStringExtra("file");
        Log.d("VP", fileUri);


        DataSpec dataSpec = new DataSpec(Uri.parse(fileUri));
        final FileDataSource fileDataSource = new FileDataSource();
        try {
            fileDataSource.open(dataSpec);
        } catch (FileDataSource.FileDataSourceException e) {
            e.printStackTrace();
        }

        DataSource.Factory factory = () -> fileDataSource;
        DataSource.Factory dataSourceFactory =
                new DefaultDataSourceFactory(this, Util.getUserAgent(this, getApplicationInfo().name));

        MediaSource mediaSource =
                new ProgressiveMediaSource.Factory(dataSourceFactory).createMediaSource(
                        fileDataSource.getUri());

        boolean haveResumePosition = lastPlaybackPosition != C.INDEX_UNSET;
        if (player == null) {
            player = ExoPlayerFactory.newSimpleInstance(this);
            player.setAudioAttributes(AudioAttributes.DEFAULT, /* handleAudioFocus= */ true);
            player.setPlayWhenReady(playWhenReady);
            player.addListener(new PlayerEventListener(this));
            playerView.setPlayer(player);
            playerView.setPlaybackPreparer(this);
        }
        player.prepare(mediaSource, true, true);

        if (haveResumePosition) {
            player.seekTo(currentWindow, lastPlaybackPosition);
        }
    }

    @Override
    public void onClick(View v) {

    }

    @Override
    public void preparePlayback() {

    }

    @Override
    public void onVisibilityChange(int visibility) {

    }


    private static class PlayerEventListener implements Player.EventListener {

        private final Activity activity;

        PlayerEventListener(Activity activity){
            this.activity = activity;
        }

        @Override
        public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {
            if(playbackState == ExoPlayer.STATE_ENDED) activity.finish();
        }



        @Override
        public void onPlayerError(ExoPlaybackException e) {

        }

    }


}