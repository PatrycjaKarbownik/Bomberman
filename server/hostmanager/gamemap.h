#ifndef GAMEMAP_H
#define GAMEMAP_H

#include <QObject>

class GameMap : public QObject
{
    Q_OBJECT
public:
    explicit GameMap(QObject *parent = nullptr);
    void generate();

signals:

public slots:

private:
    bool m_generated = false;
};

#endif // GAMEMAP_H
