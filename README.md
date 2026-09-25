# Godest

A Vencord plugin that bypasses Discord age verification so age restricted channels load without proving your age.

## What it does

Discord blocks age restricted channels two ways: the messages API returns 403 when the client declares a build number, and the client shows an age gate based on your account age group. Godest stops the client from declaring that build number and reports an adult age group, so the channel loads normally.

## Notes

Nothing is written to your Discord account. The changes are in memory only and disappear when you close the client.

I am not explaining how to install this. There are videos out there.
