QT -= gui
QT += network websockets

CONFIG += c++17 console
CONFIG -= app_bundle

# Enable QT logging
DEFINES += QT_MESSAGELOGCONTEXT
DEFINES += QT_DEPRECATED_WARNINGS

SOURCES += \
        gamehost.cpp \
        gamehostshub.cpp \
        gamemap.cpp \
        main.cpp \
        overseercommunication.cpp \
        player.cpp \
        room.cpp

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

HEADERS += \
    gamehost.h \
    gamehostshub.h \
    gamemap.h \
    overseercommunication.h \
    player.h \
    room.h
