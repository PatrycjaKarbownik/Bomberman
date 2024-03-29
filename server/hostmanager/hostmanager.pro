QT -= gui
QT += network websockets

CONFIG += c++17 console
CONFIG -= app_bundle
#CONFIG += testcase # Add ability to use make check

# Enable QT logging
DEFINES += QT_MESSAGELOGCONTEXT
DEFINES += QT_DEPRECATED_WARNINGS

SOURCES += \
        bomb.cpp \
        gamehost.cpp \
        gamehostshub.cpp \
        gamemap.cpp \
        overseercommunication.cpp \
        player.cpp \
        room.cpp

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

HEADERS += \
    bomb.h \
    gamehost.h \
    gamehostshub.h \
    gamemap.h \
    overseercommunication.h \
    player.h \
    room.h \

# Special configuration for tests
test_conf {
    TARGET = hostmanager_test
    QT += testlib

    SOURCES +=  \
            tests/maintest.cpp \
            tests/testgamemap.cpp

    HEADERS += \
            tests/testgamemap.h
} else {

    SOURCES += main.cpp
}
