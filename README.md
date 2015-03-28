# Cylon.js For BeagleBone

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics and physical computing using Node.js

This module provides an adaptor for the BeagleBone Black single-board computer (http://beagleboard.org/Products/BeagleBone+Black/)

Want to use Ruby on robots? Check out our sister project Artoo (http://artoo.io)

Want to use the Go programming language to power your robots? Check out our sister project Gobot (http://gobot.io).

[![Build Status](https://secure.travis-ci.org/hybridgroup/cylon-beaglebone.png?branch=master)](http://travis-ci.org/hybridgroup/cylon-beaglebone) [![Code Climate](https://codeclimate.com/github/hybridgroup/cylon-beaglebone/badges/gpa.svg)](https://codeclimate.com/github/hybridgroup/cylon-beaglebone) [![Test Coverage](https://codeclimate.com/github/hybridgroup/cylon-beaglebone/badges/coverage.svg)](https://codeclimate.com/github/hybridgroup/cylon-beaglebone)

## How to Install

Installing Cylon.js for the BeagleBone Black is pretty easy, but must be done on the Beaglebone Black itself, or on another Linux computer.
Due to I2C device support, the module cannot be installed on OS X or Windows.

    $ npm install cylon cylon-beaglebone

## How to Use

```javascript
var Cylon = require('cylon');

// Initialize the robot
Cylon.robot({
  connections: {
    beaglebone: { adaptor: 'beaglebone' }
  },

  devices: {
    led: { driver: 'led', pin: 'P9_12' },
    button: { driver: 'button', pin: 'P9_14' }
  },

  work: function(my) {
    my.button.on('push', function() {my.led.toggle()});
  }
}).start();
```

## How to Connect

You will likely want to connect your development machine to your BeagleBone Black while working on your code. You can do this easily, just by connecting to the BeagleBone Black over USB. Then, you can connect to the BBB using Network-Over-USB, and upload driver or configuration changes.

### Important Note About Voltages

The Beaglebone Black is a 3.3V device. You will need a logic level converter to work with 5V devices, such as this one from [SparkFun](https://www.sparkfun.com/products/12009) or this one from [Adafruit](http://www.adafruit.com/products/757).

Furthermore, the Analog to Digital Converters (ADC) cannot handle more than 1.8V input, so keep this in mind when connecting to analog devices, or risk burning up your BBB.

### OS X

For OS X, some drivers need to be installed to allow Network-Over-USB access to the BeagleBone black.
You can find the instructions on the BeagleBone site's [getting started page](http://beagleboard.org/getting-started#step2).

Once you've installed the drivers and connected to the BeagleBone over USB, you can just SSH into it.
The BBB should have an IP address of `192.168.7.2`.

### Linux

For Linux machines, you will need to create a udev rule.
You can find the instructions on the BeagleBone site's [getting started page](http://beagleboard.org/getting-started#step2).

To connect to the BeagleBone Black from your Linux machine, save this script as `bbb.sh` (or whatever name you'd prefer).
Executing the script will then SSH into the BBB.

```bash
#!/bin/bash
sudo -- sh -c 'echo 1 > /proc/sys/net/ipv4/ip_forward'
sudo iptables -A POSTROUTING -t nat -j MASQUERADE
ssh root@192.168.7.2
```

### Windows

For Windows, some drivers need to be installed to allow Network-Over-USB access to the BeagleBone black.
You can find the instructions on the BeagleBone site's [getting started page](http://beagleboard.org/getting-started#step2).

The connection process for Windows is a bit more involved.
But when you're done, it should be just as simple to connect to the board.

- First, follow [this guide](http://lanceme.blogspot.com/2013/06/windows-7-internet-sharing-for.html) for setting up Internet Sharing on your Windows computer
- Next, install [PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html) (or your preferred SSH client) to SSH into the BeagleBone Black
- Finally, SSH into the BBB. It will have the same IP address (`192.168.7.2`)

### Credentials

By default, the BeagleBone's login credentials are:

- **user:** `root`
- **pass:** none

## Creating a BeagleBone Black SD Card with Debian

You may need to create a bootable SD card with the BBB Debian Linux distro.

### Finding the SD Card's Name

#### OS X

To find the name of the SD card on OS X, use the `diskutil` command:

    $ diskutil list
    /dev/disk0
      #:                       TYPE NAME                    SIZE       IDENTIFIER
      0:      GUID_partition_scheme                        *500.3 GB   disk0
      1:                        EFI EFI                     209.7 MB   disk0s1
      2:                  Apple_HFS Macintosh HD            499.4 GB   disk0s2
      3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
    /dev/disk1
      #:                       TYPE NAME                    SIZE       IDENTIFIER
      0:     FDisk_partition_scheme                        *15.9 GB    disk1
      1:                 DOS_FAT_32 UNTITLED                15.9 GB    disk1s1

In this case, the SD card's name is `/dev/disk1`.
Before you proceed, be sure to eject the mounted volume:

    $ diskutil umount /dev/disk1s1

#### Linux

On most Linux distros, the `df -h` command should help you determine the name of your SD card.

### Downloading the Linux Image, Flashing the SD Card

The image we're using is the official modified Debian distro provided by BeagleBoard, so we'll download it directly from them:
[http://debian.beagleboard.org/images/bone-debian-7.8-lxde-4gb-armhf-2015-03-01-4gb.img.xz](http://debian.beagleboard.org/images/bone-debian-7.8-lxde-4gb-armhf-2015-03-01-4gb.img.xz).

Once the image has downloaded, uncompress it like this:

    unxz bone-debian-7.8-lxde-4gb-armhf-2015-03-01-4gb.img.xz

The final step is to flash the image onto the SD card.
You can do so by running this command (be sure to update the `of` section to point to the SD card name you found earlier!):

    $ sudo dd bs=1M if=./bone-debian-7.8-lxde-4gb-armhf-2015-03-01-4gb.img of=/dev/sdb && sudo sync

## Booting Off Of The SD Card

Insert SD card into your (powered-down) board, hold down the USER/BOOT button (if using Black) and apply power, either by the USB cable or 5V adapter.

## Configuring the BeagleBone Black

After SSHing into the BeagleBone Black, save the following script into `~/profile`.
Be sure to do this **on the BBB**.
This will allow your BeagleBone Black to share your computer's internet connection.

```bash
#!/bin/bash
ROUTE=`route | grep 0.0.0.0 | wc -l`
if [ $ROUTE -eq 0 ]
then
    sudo -- sh -c 'echo "nameserver 8.8.8.8" >> /etc/resolv.conf'
    sudo /sbin/route add default gw 192.168.7.1
    ping www.google.com -q -c2 > /dev/null
    if [ $? -eq 0 ]; then
        sudo ntpdate ntp.ubuntu.com
    fi
fi
```

After the script is saved, it will automatically run when the BeagleBone Black boots, so you only have to do this step once.

### Resizing the SD Card Partition

At this point, we have a full Debian Linux OS set up, and can connect over SSH to the BBB.
Now, we need to adjust the SD card's partitions, to give us space to install dependencies and do some work.

First, login to the board over SSH, and run this series of commands:

    $ fdisk /dev/mmcblk0
    d
    2
    n
    p
    2

    w
    $ shutdown -r now

After the board finishes restarting, log back in and resize the filesystem on the SD card before another restart:

    $ resize2fs /dev/mmcblk0p2
    $ shutdown -r now

After this restart has completed, log back in, and check the partition has been correctly resized:

    $ df -h

The `/dev/root` partition should take up the entire size of the SD card.
With this done, we're now ready to start running Cylon directly on the BeagleBone Black.

## Documentation

We're busy adding documentation to our web site at http://cylonjs.com/ please check there as we continue to work on Cylon.js

Thank you!

## Contributing

* All patches must be provided under the Apache 2.0 License
* Please use the -s option in git to "sign off" that the commit is your work and you are providing it under the Apache 2.0 License
* Submit a Github Pull Request to the appropriate branch and ideally discuss the changes with us in IRC.
* We will look at the patch, test it out, and give you feedback.
* Avoid doing minor whitespace changes, renamings, etc. along with merged content. These will be done by the maintainers from time to time but they can complicate merges and should be done seperately.
* Take care to maintain the existing coding style.
* Add unit tests for any new or changed functionality & Lint and test your code using [Grunt](http://gruntjs.com/).
* All pull requests should be "fast forward"
  * If there are commits after yours use “git rebase -i <new_head_branch>”
  * If you have local changes you may need to use “git stash”
  * For git help see [progit](http://git-scm.com/book) which is an awesome (and free) book on git

## Release History

Version 0.14.1 - Adaptor now accepts callbacks and passes back the pinNum in events

Version 0.14.0 - Compatibility with Cylon 0.22.0

Version 0.13.2 - Fixes issue with first run using a PWM pin

Version 0.13.1 - Fixes issue with servo write

Version 0.13.0 - Compatibility with Cylon 0.21.0

Version 0.12.0 - Compatibility with Cylon 0.20.0

Version 0.11.0 - Compatibility with Cylon 0.19.0

Version 0.10.0 - Compatibility with Cylon 0.18.0

Version 0.9.0 - Compatibility with Cylon 0.16.0

Version 0.8.1 - Add peerDependencies to package.json

Version 0.8.0 - Compatibility with Cylon 0.15.0

Version 0.7.0 - Compatibility with Cylon 0.14.0, remove node-namespace.

Version 0.6.0 - Update to Cylon 0.12.0

Version 0.5.1 - Bugfix for i2cread, and more examples

Version 0.5.0 - Update to cylon 0.11.0, migrated to pure JS

Version 0.4.0 - Update to cylon 0.10.0

Version 0.3.0 - Release for cylon 0.9.0

Version 0.2.0 - Release for cylon 0.8.0

Version 0.1.0 - Initial release

## License
Copyright (c) 2013-2015 The Hybrid Group. Licensed under the Apache 2.0 license.
