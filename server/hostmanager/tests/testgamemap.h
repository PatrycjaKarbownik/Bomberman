#ifndef TESTGAMEMAP_H
#define TESTGAMEMAP_H

#include <QObject>
#include <QtTest/QtTest>



class TestGameMap : public QObject
{
    Q_OBJECT

private slots:
    void initTestCase();
    void testTest();
    void cleanupTestCase();
};

#endif // TESTGAMEMAP_H
