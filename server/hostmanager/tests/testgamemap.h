#ifndef TESTGAMEMAP_H
#define TESTGAMEMAP_H

#include <QObject>
#include <QtTest/QtTest>
#include <gamemap.h>



class TestGameMap : public QObject
{
    Q_OBJECT

private slots:
    void indexOperatorWorks();
    void indexOperatorWorksProperly();
    void jsonDumpsProperly();
};

#endif // TESTGAMEMAP_H
