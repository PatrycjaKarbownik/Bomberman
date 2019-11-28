#include <QCoreApplication>

#include "overseercommunication.h"

int main(int argc, char *argv[])
{
    // Initialize singleton at the start
    OverseerCommunication::getInstance().setOverseerPort(2);

    QCoreApplication a(argc, argv);

    return a.exec();
}
