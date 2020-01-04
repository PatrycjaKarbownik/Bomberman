#ifndef GAMEHOSTSHUB_H
#define GAMEHOSTSHUB_H

#include <QObject>

class GameHostsHub : public QObject
{
    Q_OBJECT
public:
    explicit GameHostsHub(QObject *parent = nullptr);

signals:

public slots:
};

#endif // GAMEHOSTSHUB_H
